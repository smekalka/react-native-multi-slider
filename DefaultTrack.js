import React from 'react';
import PropTypes from 'prop-types';

import {StyleSheet, View, Platform} from 'react-native';

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
            selectedStyle,
            unselectedStyle,
            children
        } = this.props;

        const trackOneLength = positionOne;
        const trackOneStyle = twoMarkers ? unselectedStyle : selectedStyle || styles.selectedTrack;
        const trackThreeLength = twoMarkers ? sliderLength - positionTwo : 0;
        const trackThreeStyle = unselectedStyle;
        const trackTwoLength = sliderLength - trackOneLength - trackThreeLength;
        const trackTwoStyle = twoMarkers ? selectedStyle || styles.selectedTrack : unselectedStyle;

        return (
            <View style={[styles.fullTrack, {width: sliderLength}]}>
                <View style={[styles.track, this.props.trackStyle, trackOneStyle, {width: trackOneLength}]} />
                <View style={[styles.track, this.props.trackStyle, trackTwoStyle, {width: trackTwoLength}]} />
                {twoMarkers && (
                    <View style={[styles.track, this.props.trackStyle, trackThreeStyle, {width: trackThreeLength}]} />
                )}
                {children}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    fullTrack: {
        flexDirection: 'row'
    },
    track: {
        ...Platform.select({
            ios: {
                height: 2,
                borderRadius: 2,
                backgroundColor: '#A7A7A7'
            },
            android: {
                height: 2,
                backgroundColor: '#CECECE'
            }
        })
    },
    selectedTrack: {
        ...Platform.select({
            ios: {
                backgroundColor: '#095FFF'
            },
            android: {
                backgroundColor: '#0D8675'
            }
        })
    }
});
