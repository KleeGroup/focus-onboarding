import i18next from "i18next";
import {IReactionDisposer, reaction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import Joyride from "react-joyride";

import {onboardingStore} from "./store";

export interface OnboardingContainerProps {
    callback?: (scope: string, props: any) => void;
    i18nPrefix?: string;
    autoStart?: boolean;
}

@observer
export class OnboardingContainer extends React.Component<OnboardingContainerProps, {}> {
    joyride: Joyride | null;
    joyrideUpdater: IReactionDisposer;

    componentWillMount() {
        this.joyrideUpdater = reaction(
            () => onboardingStore.steps.slice(),
            () => {
                if (this.joyride) {
                    this.joyride.setState({shouldRedraw: true} as any);
                }
            }
        );
    }
    componentWillUnmount() {
        this.joyrideUpdater();
    }

    callback = (props: {type: string}) => {
        const {currentScope} = onboardingStore;

        if (props.type === "finished") {
            onboardingStore.onboardingActivated[onboardingStore.currentScope] = false;
            this.joyride!.reset(!!onboardingStore.steps.length);
        }

        if (this.props.callback) {
            this.props.callback(currentScope, props);
        }
    }

    render() {
        const {steps, joyrideType, scrollToSteps, currentScope} = onboardingStore;
        const {i18nPrefix = "focus", autoStart} = this.props;
        return (
            <Joyride
                ref={joyride => (this.joyride = joyride)}
                run={!!steps.length}
                autoStart={!!steps.length && autoStart}
                showSkipButton={true}
                showStepsProgress={true}
                type={joyrideType}
                showOverlay={true}
                steps={steps.map(step => ({
                    ...step,
                    target: "",
                    selector: step.selector ? step.selector : `.${currentScope}-${step.idx + 1}`
                }))}
                scrollToSteps={scrollToSteps}
                callback={this.callback}
                locale={{
                    last: i18next.t(`${i18nPrefix}.onboarding.last`),
                    back: i18next.t(`${i18nPrefix}.onboarding.back`),
                    next: i18next.t(`${i18nPrefix}.onboarding.next`),
                    skip: i18next.t(`${i18nPrefix}.onboarding.skip`),
                    close: i18next.t(`${i18nPrefix}.onboarding.close`)
                }}
            />
        );
    }
}
