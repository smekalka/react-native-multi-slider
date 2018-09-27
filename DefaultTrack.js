import React from 'react';
import PropTypes from 'prop-types';

import {View} from 'react-native';
import {trackStyles} from './styles';

const ViewPropTypes = require('react-native').ViewPropTypes || View.propTypes;

export default class DefaultTrack extends React.Component {
    static propTypes = {
        positionOne: PropTypes.number,
        positionTwo: PropTypes.number,
        sliderLength: PropTypes.number,
        twoMarkers: PropTypes.bool,
        trackStyle: ViewPropTypes.style,
        selectedStyle: ViewPropTypes.style,
        unselectedStyle: ViewPropTypes.style,
        children: PropTypes.node
    };

    render() {
        const {
            positionOne,
            positionTwo,
            sliderLength,
            twoMarkers,
            trackStyle,
            selectedStyle,
            unselectedStyle,
            children
        } = this.props;

        const trackOneLength = positionOne;
        const trackOneStyle = twoMarkers ? unselectedStyle : selectedStyle || trackStyles.selectedTrack;
        const trackThreeLength = twoMarkers ? sliderLength - positionTwo : 0;
        const trackThreeStyle = unselectedStyle;
        const trackTwoLength = sliderLength - trackOneLength - trackThreeLength;
        const trackTwoStyle = twoMarkers ? selectedStyle || trackStyles.selectedTrack : unselectedStyle;

        return (
            <View style={[trackStyles.fullTrack, {width: sliderLength}]}>
                <View style={[trackStyles.track, trackStyle, trackOneStyle, {width: trackOneLength}]} />
                <View style={[trackStyles.track, trackStyle, trackTwoStyle, {width: trackTwoLength}]} />
                {twoMarkers && (
                    <View style={[trackStyles.track, trackStyle, trackThreeStyle, {width: trackThreeLength}]} />
                )}
                {children}
            </View>
        );
    }
}
