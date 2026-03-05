import React from 'react';
import tnLogo from '../../Tamil_Nadu_State.webp';
import { Loader2 } from 'lucide-react';

export const TnLoader = ({ text = "LOADING..." }: { text?: string }) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 gap-3 w-full">
            <img src={tnLogo} alt="Tamil Nadu State Logo" className="w-10 h-10 object-contain" />
            <div className="flex items-center text-xs font-bold uppercase tracking-wider text-[#64748B]">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                {text}
            </div>
        </div>
    );
};
