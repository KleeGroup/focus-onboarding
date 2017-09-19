import {autobind} from "core-decorators";
import i18next from "i18next";
import {isArray, toPairs} from "lodash";
import {reaction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import Joyride from "react-joyride";

import {onboardingStore} from "./store";

export interface OnboardingContainerProps {
    callback?: (scope: string, props: any) => void;
    i18nPrefix?: string;
}

@autobind
@observer
export class OnboardingContainer extends React.Component<OnboardingContainerProps, void>  {

    joyride: Joyride;

    joyrideUpdater: Function;
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

    callback(props: {type: string}) {
        const {currentScope} = onboardingStore;

        if (props.type === "finished") {
            onboardingStore.onboardingActivated[onboardingStore.currentScope] = false;
            toPairs(onboardingStore.steps).forEach(([scope, steps]: [string, number | number[]]) => {
                if (isArray(steps)) {
                    steps.forEach(step => onboardingStore.onboardingReady[scope][step - 1] = false);
                } else {
                    onboardingStore.onboardingReady[scope][steps - 1] = false;
                }
            });
            this.joyride.reset(!!onboardingStore.steps.length);
        }

        if (this.props.callback) {
            this.props.callback(currentScope, props);
        }
    }

    render() {
        const {steps, joyrideType, scrollToSteps} = onboardingStore;
        const {i18nPrefix = "focus"} = this.props;
        return (
            <Joyride
                ref={joyride => this.joyride = joyride}
                run={!!steps.length}
                showSkipButton={true}
                showStepsProgress={true}
                type={joyrideType}
                showOverlay={true}
                steps={steps}
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
