import React from 'react';
import PropTypes from 'prop-types';

import {PanResponder, View, I18nManager} from 'react-native';

import DefaultMarker from './DefaultMarker';
import DefaultTrack from './DefaultTrack';
import {createArray, valueToPosition, positionToValue} from './converters';
import {sliderStyles} from './styles';

const ViewPropTypes = require('react-native').ViewPropTypes || View.propTypes;

export default class MultiSlider extends React.Component {
    static propTypes = {
        values: PropTypes.arrayOf(PropTypes.number),

        onValuesChangeStart: PropTypes.func,
        onValuesChange: PropTypes.func,
        onValuesChangeFinish: PropTypes.func,

        sliderLength: PropTypes.number,
        touchDimensions: PropTypes.object,

        customMarker: PropTypes.func,
        customTrack: PropTypes.func,

        customMarkerLeft: PropTypes.func,
        customMarkerRight: PropTypes.func,
        isMarkersSeparated: PropTypes.bool,

        min: PropTypes.number,
        max: PropTypes.number,
        step: PropTypes.number,

        optionsArray: PropTypes.array,

        containerStyle: ViewPropTypes.style,
        trackStyle: ViewPropTypes.style,
        selectedStyle: ViewPropTypes.style,
        unselectedStyle: ViewPropTypes.style,
        markerContainerStyle: ViewPropTypes.style,
        markerStyle: ViewPropTypes.style,
        pressedMarkerStyle: ViewPropTypes.style,

        valuePrefix: PropTypes.string,
        valueSuffix: PropTypes.string,

        enabledOne: PropTypes.bool,
        enabledTwo: PropTypes.bool,

        onToggleOne: PropTypes.func,
        onToggleTwo: PropTypes.func,

        markerOffsetX: PropTypes.number,
        markerOffsetY: PropTypes.number,

        allowOverlap: PropTypes.bool,
        snapped: PropTypes.bool,
        vertical: PropTypes.bool
    };

    static defaultProps = {
        values: [0],
        onValuesChangeStart: () => {},
        onValuesChange: values => values,
        onValuesChangeFinish: values => values,
        step: 1,
        min: 0,
        max: 10,
        touchDimensions: {
            height: 50,
            width: 50,
            borderRadius: 15,
            slipDisplacement: 200
        },

        customMarker: DefaultMarker,
        customMarkerLeft: DefaultMarker,
        customMarkerRight: DefaultMarker,
        isMarkersSeparated: false,

        customTrack: DefaultTrack,

        markerOffsetX: 0,
        markerOffsetY: 0,
        sliderLength: 280,
        onToggleOne: undefined,
        onToggleTwo: undefined,
        enabledOne: true,
        enabledTwo: true,
        allowOverlap: false,
        snapped: false,
        vertical: false
    };

    constructor(props) {
        super(props);

        this.optionsArray = this.props.optionsArray || createArray(this.props.min, this.props.max, this.props.step);
        this.stepLength = this.props.sliderLength / this.optionsArray.length;

        const initialValues = this.props.values.map(value =>
            valueToPosition(value, this.optionsArray, this.props.sliderLength)
        );

        this.state = {
            pressedOne: true,
            valueOne: this.props.values[0],
            valueTwo: this.props.values[1],
            pastOne: initialValues[0],
            pastTwo: initialValues[1],
            positionOne: initialValues[0],
            positionTwo: initialValues[1]
        };
    }

    componentWillMount() {
        const customPanResponder = (start, move, end) => {
            return PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onStartShouldSetPanResponderCapture: () => true,
                onMoveShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponderCapture: () => true,
                onPanResponderGrant: () => start(),
                onPanResponderMove: (evt, gestureState) => move(gestureState),
                onPanResponderTerminationRequest: () => false,
                onPanResponderRelease: (evt, gestureState) => end(gestureState),
                onPanResponderTerminate: (evt, gestureState) => end(gestureState),
                onShouldBlockNativeResponder: () => true
            });
        };

        this._panResponderOne = customPanResponder(this.startOne, this.moveOne, this.endOne);
        this._panResponderTwo = customPanResponder(this.startTwo, this.moveTwo, this.endTwo);
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.min !== this.props.min ||
            nextProps.max !== this.props.max ||
            nextProps.values[0] !== this.state.valueOne ||
            nextProps.step !== this.props.step ||
            nextProps.sliderLength !== this.props.sliderLength ||
            nextProps.values[1] !== this.state.valueTwo ||
            (nextProps.sliderLength !== this.props.sliderLength && nextProps.values[1])
        ) {
            let nextState = {};

            this.optionsArray = this.props.optionsArray || createArray(nextProps.min, nextProps.max, nextProps.step);

            this.stepLength = this.props.sliderLength / this.optionsArray.length;

            nextState.valueOne = nextProps.values[0];
            nextState.positionOne = valueToPosition(nextState.valueOne, this.optionsArray, nextProps.sliderLength);
            const positionOneShift = nextState.positionOne - this.state.positionOne;
            nextState.pastOne = this.state.onePressed ? this.state.pastOne + positionOneShift : nextState.positionOne;

            if (nextProps.values.length === 2) {
                nextState.valueTwo = nextProps.values[1];
                nextState.positionTwo = valueToPosition(nextProps.values[1], this.optionsArray, nextProps.sliderLength);
                const positionTwoShift = nextState.positionTwo - this.state.positionTwo;
                nextState.pastTwo = this.state.twoPressed
                    ? this.state.pastTwo + positionTwoShift
                    : nextState.positionTwo;
            }

            this.setState(nextState);
        }
    }

    startOne = () => {
        if (this.props.enabledOne) {
            this.props.onValuesChangeStart();
            this.setState({
                onePressed: !this.state.onePressed
            });
        }
    };

    startTwo = () => {
        if (this.props.enabledTwo) {
            this.props.onValuesChangeStart();
            this.setState({
                twoPressed: !this.state.twoPressed
            });
        }
    };

    moveOne = gestureState => {
        if (!this.props.enabledOne) {
            return;
        }

        const accumDistance = this.props.vertical ? -gestureState.dy : gestureState.dx;
        const accumDistanceDisplacement = this.props.vertical ? gestureState.dx : gestureState.dy;

        // distance from the past position not accounting for it being outside slider
        const unconfined = I18nManager.isRTL ? this.state.pastOne - accumDistance : accumDistance + this.state.pastOne;
        const bottom = 0;
        const trueTop = this.state.positionTwo - (this.props.allowOverlap ? 0 : this.stepLength);
        const top = trueTop === 0 ? 0 : trueTop || this.props.sliderLength;

        // distance from the past position limited by how much it can change within slider dimensions
        const confined = unconfined < bottom ? bottom : unconfined > top ? top : unconfined;
        const slipDisplacement = this.props.touchDimensions.slipDisplacement;

        // update position and value if touch is within allowed distance from slider
        if (Math.abs(accumDistanceDisplacement) < slipDisplacement || !slipDisplacement) {
            const value = positionToValue(confined, this.optionsArray, this.props.sliderLength);
            const snapped = valueToPosition(value, this.optionsArray, this.props.sliderLength);

            this.setState({
                positionOne: this.props.snapped ? snapped : confined // snap button to predefined positions for values or place it freely on slider
            });

            if (value !== this.state.valueOne) {
                this.setState(
                    {
                        valueOne: value
                    },
                    () => {
                        let change = [this.state.valueOne];
                        if (this.state.valueTwo) {
                            change.push(this.state.valueTwo);
                        }
                        this.props.onValuesChange(change);
                    }
                );
            }
        }
    };

    moveTwo = gestureState => {
        if (!this.props.enabledTwo) {
            return;
        }

        const accumDistance = this.props.vertical ? -gestureState.dy : gestureState.dx;
        const accumDistanceDisplacement = this.props.vertical ? gestureState.dx : gestureState.dy;

        const unconfined = I18nManager.isRTL ? this.state.pastTwo - accumDistance : accumDistance + this.state.pastTwo;
        const bottom = this.state.positionOne + (this.props.allowOverlap ? 0 : this.stepLength);
        const top = this.props.sliderLength;
        const confined = unconfined < bottom ? bottom : unconfined > top ? top : unconfined;
        const slipDisplacement = this.props.touchDimensions.slipDisplacement;

        if (Math.abs(accumDistanceDisplacement) < slipDisplacement || !slipDisplacement) {
            const value = positionToValue(confined, this.optionsArray, this.props.sliderLength);
            const snapped = valueToPosition(value, this.optionsArray, this.props.sliderLength);

            this.setState({
                positionTwo: this.props.snapped ? snapped : confined
            });

            if (value !== this.state.valueTwo) {
                this.setState(
                    {
                        valueTwo: value
                    },
                    () => {
                        this.props.onValuesChange([this.state.valueOne, this.state.valueTwo]);
                    }
                );
            }
        }
    };

    endOne = gestureState => {
        if (gestureState.moveX === 0 && this.props.onToggleOne) {
            this.props.onToggleOne();
            return;
        }

        this.setState(
            {
                pastOne: this.state.positionOne,
                onePressed: !this.state.onePressed
            },
            () => {
                let change = [this.state.valueOne];
                if (this.state.valueTwo) {
                    change.push(this.state.valueTwo);
                }
                this.props.onValuesChangeFinish(change);
            }
        );
    };

    endTwo = gestureState => {
        if (gestureState.moveX === 0 && this.props.onToggleTwo) {
            this.props.onToggleTwo();
            return;
        }

        this.setState(
            {
                twoPressed: !this.state.twoPressed,
                pastTwo: this.state.positionTwo
            },
            () => {
                this.props.onValuesChangeFinish([this.state.valueOne, this.state.valueTwo]);
            }
        );
    };

    render() {
        const {positionOne, positionTwo, valueOne, valueTwo, onePressed, twoPressed} = this.state;
        const {
            values,
            sliderLength,
            touchDimensions,
            vertical,

            enabledOne,
            enabledTwo,

            customMarker,
            customMarkerLeft,
            customMarkerRight,
            markerOffsetX,
            markerOffsetY,
            isMarkersSeparated,

            customTrack,

            valuePrefix,
            valueSuffix,

            containerStyle,
            trackStyle,
            selectedStyle,
            unselectedStyle,
            markerContainerStyle,
            markerStyle,
            pressedMarkerStyle
        } = this.props;
        const twoMarkers = values.length == 2; // when allowOverlap, positionTwo could be 0, identified as string '0' and throwing 'RawText 0 needs to be wrapped in <Text>' error

        const Marker = customMarker;
        const MarkerLeft = customMarkerLeft;
        const MarkerRight = customMarkerRight;

        const Track = customTrack;

        const {borderRadius} = touchDimensions;
        const touchStyle = {
            borderRadius: borderRadius || 0
        };

        const markerContainerOne = {top: markerOffsetY - 24, left: positionOne + markerOffsetX - 24};
        const markerContainerTwo = {top: markerOffsetY - 24, left: positionTwo + markerOffsetX - 24};

        const containerStylesCombined = [sliderStyles.container, containerStyle];

        if (vertical) {
            containerStylesCombined.push({
                transform: [{rotate: '-90deg'}]
            });
        }

        return (
            <View style={containerStylesCombined}>
                <Track
                    positionOne={positionOne}
                    positionTwo={positionTwo}
                    sliderLength={sliderLength}
                    twoMarkers={twoMarkers}
                    trackStyle={trackStyle}
                    selectedStyle={selectedStyle}
                    unselectedStyle={unselectedStyle}
                />
                <View
                    style={[
                        sliderStyles.markerContainer,
                        markerContainerOne,
                        markerContainerStyle,
                        positionOne > sliderLength / 2 && sliderStyles.topMarkerContainer
                    ]}>
                    <View
                        style={[sliderStyles.touch, touchStyle]}
                        ref={component => (this._markerOne = component)}
                        {...this._panResponderOne.panHandlers}>
                        {isMarkersSeparated === false ? (
                            <Marker
                                enabled={enabledOne}
                                pressed={onePressed}
                                markerStyle={[sliderStyles.marker, markerStyle]}
                                pressedMarkerStyle={pressedMarkerStyle}
                                currentValue={valueOne}
                                valuePrefix={valuePrefix}
                                valueSuffix={valueSuffix}
                            />
                        ) : (
                            <MarkerLeft
                                enabled={enabledOne}
                                pressed={onePressed}
                                markerStyle={[sliderStyles.marker, markerStyle]}
                                pressedMarkerStyle={pressedMarkerStyle}
                                currentValue={valueOne}
                                valuePrefix={valuePrefix}
                                valueSuffix={valueSuffix}
                            />
                        )}
                    </View>
                </View>

                {twoMarkers &&
                    positionOne !== sliderLength && (
                        <View style={[sliderStyles.markerContainer, markerContainerTwo, markerContainerStyle]}>
                            <View
                                style={[sliderStyles.touch, touchStyle]}
                                ref={component => (this._markerTwo = component)}
                                {...this._panResponderTwo.panHandlers}>
                                {isMarkersSeparated === false ? (
                                    <Marker
                                        pressed={twoPressed}
                                        markerStyle={markerStyle}
                                        pressedMarkerStyle={pressedMarkerStyle}
                                        currentValue={valueTwo}
                                        enabled={enabledTwo}
                                        valuePrefix={valuePrefix}
                                        valueSuffix={valueSuffix}
                                    />
                                ) : (
                                    <MarkerRight
                                        pressed={twoPressed}
                                        markerStyle={markerStyle}
                                        pressedMarkerStyle={pressedMarkerStyle}
                                        currentValue={valueTwo}
                                        enabled={enabledTwo}
                                        valuePrefix={valuePrefix}
                                        valueSuffix={valueSuffix}
                                    />
                                )}
                            </View>
                        </View>
                    )}
            </View>
        );
    }
}
