import {isArray, toPairs} from "lodash";
import {action} from "mobx";
import * as React from "react";

import {onboardingStore} from "./store";

export interface OnboardingItemProps {
    steps: {[scope: string]: number | number[]};
}

export class OnboardingItem extends React.Component<OnboardingItemProps, void> {

    componentDidMount() {
        this.checkIfComponentIsReady(true);
    }

    componentWillUnmount() {
        this.checkIfComponentIsReady(false);
    }

    @action
    checkIfComponentIsReady(isReady: boolean) {
        toPairs(this.props.steps).forEach(([scope, steps]: [string, number | number[]]) => {
            if (isArray(steps)) {
                steps.forEach(step => onboardingStore.onboardingReady[scope][step - 1] = isReady);
            } else {
                onboardingStore.onboardingReady[scope][steps - 1] = isReady;
            }
        });
    }

    render() {
        return (
            <div data-onboarding>
                 {this.props.children}
            </div>
        );
    }
}
