import fetchMock from 'jest-fetch-mock';
import { View, Text } from 'react-native';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  RN.TouchableOpacity = ({ onPress, style, testID, children }) => {
    return RN.createElement(
      'TouchableOpacity',
      { onPress, style, testID },
      children
    );
  };
  
  RN.Modal = ({ visible, onRequestClose, children }) => {
    return visible ? RN.createElement('Modal', {}, children) : null;
  };
  
  RN.Image = ({ source, style }) => {
    return RN.createElement('Image', { source, style });
  };
  
  RN.Slider = ({ value, onValueChange, minimumValue, maximumValue, style }) => {
    return RN.createElement('Slider', { value, onValueChange, minimumValue, maximumValue, style });
  };
  
  RN.Animated = {
    ...RN.Animated,
    View: ({ style, children, ...props }) => RN.createElement('View', { style, ...props }, children),
    createAnimatedComponent: (component) => component,
    timing: jest.fn(() => ({ start: jest.fn(cb => cb && cb()) })),
    spring: jest.fn(() => ({ start: jest.fn(cb => cb && cb()) })),
    parallel: jest.fn(() => ({ start: jest.fn(cb => cb && cb()) })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({
        interpolate: jest.fn(),
      })),
    })),
  };
  
  return RN;
});

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    timing: jest.fn(() => ({
      start: jest.fn(callback => callback && callback()),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(callback => callback && callback()),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn(callback => callback && callback()),
    })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({
        interpolate: jest.fn(),
      })),
    })),
  };
});

jest.mock('react-native/Libraries/Interaction/PanResponder', () => {
  return {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: View,
    MaterialCommunityIcons: View,
    FontAwesome: View,
    MaterialIcons: View,
  };
});

jest.mock('react-native-chart-kit', () => {
  const { View } = require('react-native');
  return {
    LineChart: View,
    BarChart: View,
    PieChart: View,
    ProgressChart: View,
    ContributionGraph: View,
    StackedBarChart: View,
  };
});

global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

fetchMock.enableMocks();
