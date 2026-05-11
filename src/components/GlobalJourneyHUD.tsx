import { FunctionalComponent } from 'preact';
import { useUserJourney } from '../hooks/useUserJourney';

export const GlobalJourneyHUD: FunctionalComponent = () => {
    const { progress, percentage, completedSteps, totalSteps } = useUserJourney();

    return (
        <div class="hidden xl:flex items-center gap-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl px-5 py-2 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-brand/30 group">
            <div class="flex items-center gap-3">
                <div class="relative w-8 h-8">
                    <svg class="w-8 h-8 transform -rotate-90">
                        <circle
                            cx="16"
                            cy="16"
                            r="14"
                            stroke="currentColor"
                            stroke-width="3"
                            fill="transparent"
                            class="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                            cx="16"
                            cy="16"
                            r="14"
                            stroke="currentColor"
                            stroke-width="3"
                            fill="transparent"
                            stroke-dasharray={88}
                            stroke-dashoffset={88 - (88 * percentage) / 100}
                            class="text-brand transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand">
                        {percentage}%
                    </div>
                </div>
                <div>
                    <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand transition-colors">Alliance Journey</div>
                    <div class="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase whitespace-nowrap">
                        {completedSteps}/{totalSteps} Missions Clear
                    </div>
                </div>
            </div>

            <div class="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

            <div class="flex gap-1.5">
                {Object.entries(progress).map(([key, done]) => (
                    <div 
                        key={key} 
                        class={`w-2 h-5 rounded-sm transition-all duration-500 ${
                            done 
                                ? 'bg-brand' 
                                : 'bg-slate-200 dark:bg-slate-700 opacity-50'
                        }`}
                        title={key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    />
                ))}
            </div>
        </div>
    );
};
