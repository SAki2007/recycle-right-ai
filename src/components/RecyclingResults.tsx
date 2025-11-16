import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Recycle } from "lucide-react";

interface Material {
  name: string;
  type: string;
  recyclable: string;
  instructions: string;
  preparation: string;
  binType: string;
  notes: string;
}

interface RecyclingResultsProps {
  results: {
    materials: Material[];
    summary: string;
  };
}

const getRecyclableIcon = (recyclable: string) => {
  switch (recyclable.toLowerCase()) {
    case 'yes':
      return <CheckCircle2 className="w-5 h-5 text-primary" />;
    case 'no':
      return <XCircle className="w-5 h-5 text-destructive" />;
    default:
      return <AlertCircle className="w-5 h-5 text-accent" />;
  }
};

const getRecyclableBadge = (recyclable: string) => {
  switch (recyclable.toLowerCase()) {
    case 'yes':
      return <Badge className="bg-primary/10 text-primary border-primary/20">Recyclable</Badge>;
    case 'no':
      return <Badge variant="destructive">Not Recyclable</Badge>;
    default:
      return <Badge className="bg-accent/10 text-accent border-accent/20">Conditional</Badge>;
  }
};

const getMaterialColor = (type: string) => {
  const colors: { [key: string]: string } = {
    plastic: 'bg-blue-500/10 text-blue-700 border-blue-200',
    paper: 'bg-amber-500/10 text-amber-700 border-amber-200',
    metal: 'bg-slate-500/10 text-slate-700 border-slate-200',
    glass: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
    organic: 'bg-green-500/10 text-green-700 border-green-200',
  };
  return colors[type.toLowerCase()] || 'bg-muted text-muted-foreground border-border';
};

export const RecyclingResults = ({ results }: RecyclingResultsProps) => {
  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-2 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Recycle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Analysis Summary</h3>
            <p className="text-muted-foreground leading-relaxed">{results.summary}</p>
          </div>
        </div>
      </Card>

      {/* Materials List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <span>Identified Materials</span>
          <Badge variant="outline" className="ml-2">{results.materials.length}</Badge>
        </h3>

        {results.materials.map((material, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getRecyclableIcon(material.recyclable)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-foreground mb-2">{material.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {getRecyclableBadge(material.recyclable)}
                      <Badge variant="outline" className={getMaterialColor(material.type)}>
                        {material.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div>
                  <h5 className="font-medium text-foreground mb-1 text-sm">Recycling Instructions</h5>
                  <p className="text-muted-foreground text-sm leading-relaxed">{material.instructions}</p>
                </div>

                {material.preparation && (
                  <div>
                    <h5 className="font-medium text-foreground mb-1 text-sm">Preparation Steps</h5>
                    <p className="text-muted-foreground text-sm leading-relaxed">{material.preparation}</p>
                  </div>
                )}

                {material.binType && (
                  <div>
                    <h5 className="font-medium text-foreground mb-1 text-sm">Bin Type</h5>
                    <p className="text-muted-foreground text-sm">{material.binType}</p>
                  </div>
                )}

                {material.notes && (
                  <div className="pt-2 mt-2 border-t border-border/50">
                    <div className="flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{material.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
