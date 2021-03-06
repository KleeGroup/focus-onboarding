import {intersection, mapValues, toPairs} from "lodash";
import {computed, observable} from "mobx";
import {StepStyles} from "react-joyride";

export type JoyrideType = "continuous" | "single" | undefined;

export interface OnboardingActivated {
    [key: string]: boolean;
}

export interface Step {
    title?: string;
    text?: React.ReactNode;
    position?: "top" | "top-left" | "top-right" | "bottom" | "bottom-left" | "bottom-right" | "right" | "left";
    type?: "click" | "hover";
    isFixed?: boolean;
    allowClicksThruHole?: boolean;
    style?: StepStyles;
    isOptional?: boolean;
    selector?: string;
}

export interface OnboardingConfig {
    [scope: string]: Step[];
}

export interface OnboardingReady {
    [scope: string]: boolean[];
}

/** Store for simple objet (not entity store.) */
export class OnboardingStore {
    @observable
    joyrideType: JoyrideType = "continuous";

    @observable
    scrollToSteps = false;

    @observable
    showReactivateButton = false;

    @observable
    onboardingActivated: OnboardingActivated;

    /** @internal */
    @observable
    onboardingReady: OnboardingReady;

    private onboardingConfig: OnboardingConfig;
    scopePriority?: string[];

    @computed
    get steps() {
        if (this.currentScope && this.onboardingActivated[this.currentScope]) {
            const stepArray = this.onboardingConfig[this.currentScope];
            const steps: (Step & {idx: number})[] = [];
            stepArray.forEach((step, idx) => {
                const readySteps = this.onboardingReady[this.currentScope];
                if (
                    (step.isOptional !== true && readySteps[idx] !== false) ||
                    (step.isOptional === true && readySteps[idx] === true)
                ) {
                    steps.push({...step, idx});
                }
            });
            return steps;
        }
        return [];
    }

    @computed
    get currentScope() {
        const readyScopes = toPairs(this.onboardingReady)
            .filter(([scope, list]: [string, boolean[]]) =>
                list.every((item, idx) => item || this.onboardingConfig[scope][idx].isOptional || false)
            )
            .map(scope => scope[0]);
        const activatedScopes = toPairs(this.onboardingActivated)
            .filter(scope => scope[1])
            .map(scope => scope[0]);
        const scopes = intersection(readyScopes, activatedScopes);
        return (this.scopePriority && intersection(this.scopePriority, scopes)[0]) || scopes[0];
    }

    init(onboardingConfig: OnboardingConfig, onboardingActivated?: OnboardingActivated) {
        this.onboardingConfig = onboardingConfig;
        this.onboardingActivated = onboardingActivated || mapValues(this.onboardingConfig, _ => false);
        this.onboardingReady = mapValues(onboardingConfig, steps => steps.map(_ => false));
    }
}

export const onboardingStore = new OnboardingStore();
