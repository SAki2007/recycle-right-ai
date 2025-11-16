import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing image for recyclable materials...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert recycling assistant. Analyze images of materials and provide:
1. Identified materials (be specific, e.g., "plastic water bottle", "cardboard box")
2. Recyclability status (Recyclable, Not Recyclable, or Conditionally Recyclable)
3. Specific recycling instructions for each material
4. Any preparation steps needed (cleaning, removing labels, etc.)
5. Environmental impact notes

Format your response as JSON with this structure:
{
  "materials": [
    {
      "name": "material name",
      "type": "plastic/paper/metal/glass/organic/other",
      "recyclable": "yes/no/conditional",
      "instructions": "detailed recycling instructions",
      "preparation": "preparation steps",
      "binType": "which bin to use",
      "notes": "additional environmental notes"
    }
  ],
  "summary": "brief overall recycling guidance"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please identify all recyclable materials in this image and provide detailed recycling instructions.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service quota exceeded. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI model');
    }

    console.log('Successfully analyzed image');

    // Try to parse JSON from the response
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      // Fallback to returning raw content
      result = {
        materials: [{
          name: 'Analysis Result',
          type: 'other',
          recyclable: 'conditional',
          instructions: content,
          preparation: 'See instructions',
          binType: 'See instructions',
          notes: 'Please review the full analysis above'
        }],
        summary: 'Unable to parse structured response. See details above.'
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in identify-material function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Please try again with a clear photo of recyclable materials.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
