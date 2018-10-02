import {flatten, isArray, toPairs} from "lodash";
import {action} from "mobx";
import * as React from "react";

import {onboardingStore} from "./store";

export interface OnboardingItemProps {
    steps: {[scope: string]: number | number[]};
}

export class OnboardingItem extends React.Component<OnboardingItemProps> {
    componentDidMount() {
        this.checkIfComponentIsReady(true);
    }

    componentWillUnmount() {
        this.checkIfComponentIsReady(false);
    }

    @action
    checkIfComponentIsReady(isReady: boolean) {
        toPairs(this.props.steps).forEach(([scope, steps]) => {
            if (isArray(steps)) {
                steps.forEach(step => (onboardingStore.onboardingReady[scope][step - 1] = isReady));
            } else {
                onboardingStore.onboardingReady[scope][steps - 1] = isReady;
            }
        });
    }

    get className() {
        return flatten(
            toPairs(this.props.steps).map(([scope, steps]) => {
                if (isArray(steps)) {
                    return steps.map(step => `${scope}-${step}`);
                } else {
                    return [`${scope}-${steps}`];
                }
            })
        ).join(" ");
    }

    render() {
        return (
            <div data-onboarding className={this.className}>
                {this.props.children}
            </div>
        );
    }
}
