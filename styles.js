import {StyleSheet, Platform} from 'react-native';

export const sliderStyles = StyleSheet.create({
    container: {
        position: 'relative',
        height: 50,
        justifyContent: 'center'
    },
    markerContainer: {
        position: 'absolute',
        width: 48,
        height: 48,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
    },
    topMarkerContainer: {
        zIndex: 1
    },
    touch: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch'
    }
});


export const markerStyles = StyleSheet.create({
  markerStyle: {
    ...Platform.select({
      ios: {
        height: 30,
        width: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowRadius: 1,
        shadowOpacity: 0.2,
      },
      android: {
        height: 12,
        width: 12,
        borderRadius: 12,
        backgroundColor: '#0D8675',
      },
    }),
  },
  pressedMarkerStyle: {
    ...Platform.select({
      ios: {},
      android: {
        height: 20,
        width: 20,
        borderRadius: 20,
      },
    }),
  },
  disabled: {
    backgroundColor: '#d3d3d3',
  },
});

export const trackStyles = StyleSheet.create({
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
