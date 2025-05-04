import 'react-native-gesture-handler/jestSetup';
import fetchMock from 'jest-fetch-mock';

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
