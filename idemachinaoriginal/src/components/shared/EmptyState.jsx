
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export default function EmptyState({ title, description, actionText, actionUrl }) {
    return (
        <div className="text-center py-20">
            <div className="brutalist-border bg-white p-12 brutalist-shadow max-w-md mx-auto transform -rotate-1">
                <div className="w-20 h-20 bg-gray-100 brutalist-border mx-auto mb-6 flex items-center justify-center transform rotate-3">
                    <Lightbulb className="w-10 h-10 text-gray-400" />
                </div>
                
                <h3 className="brutalist-text text-2xl text-black mb-4">
                    {title}
                </h3>
                
                <p className="font-bold text-gray-600 uppercase tracking-wider text-sm mb-8">
                    {description}
                </p>
                
                <Link to={createPageUrl(actionUrl)}>
                    <Button className="brutalist-border bg-blue-600 text-white hover:bg-blue-700 brutalist-text px-8 py-3 brutalist-shadow transform hover:translate-y-[-2px] transition-all duration-200">
                        {actionText}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
