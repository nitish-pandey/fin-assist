import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Building, ChevronRight } from "lucide-react";
import { Organization } from "@/data/types";

interface OrganizationCardProps {
    organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
    return (
        <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    {organization.logo ? (
                        <img
                            src={organization.logo}
                            alt={organization.name}
                            className="h-16 w-16 rounded-full object-cover"
                        />
                    ) : (
                        <Building className="h-16 w-16 text-primary" />
                    )}
                    <div>
                        <h2 className="text-xl font-semibold">{organization.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {organization.description || "No description available."}
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <Link
                    to={`/org/${organization.id}/dashboard`}
                    className="flex items-center justify-between w-full text-primary hover:underline"
                >
                    <span className="text-sm font-medium">View Dashboard</span>
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </CardFooter>
        </Card>
    );
}
