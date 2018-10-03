import React from 'react';
import PropTypes from 'prop-types';

import {View, TouchableHighlight} from 'react-native';
import {markerStyles} from './styles';

const ViewPropTypes = require('react-native').ViewPropTypes || View.propTypes;

export default class DefaultMarker extends React.Component {
    static propTypes = {
        pressed: PropTypes.bool,
        pressedMarkerStyle: ViewPropTypes.style,
        markerStyle: ViewPropTypes.style,
        enabled: PropTypes.bool,
        currentValue: PropTypes.number,
        valuePrefix: PropTypes.string,
        valueSuffix: PropTypes.string,
    };

    render() {
        return (
            <TouchableHighlight>
                <View
                    style={this.props.enabled ? [
                        markerStyles.markerStyle,
                        this.props.markerStyle,
                        this.props.pressed && markerStyles.pressedMarkerStyle,
                        this.props.pressed && this.props.pressedMarkerStyle,
                    ] : [markerStyles.markerStyle, markerStyles.disabled]}
                />
            </TouchableHighlight>
        );
    }
}

