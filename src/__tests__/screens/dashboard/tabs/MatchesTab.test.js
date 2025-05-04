import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MatchesTab from '../../../../screens/dashboard/tabs/MatchesTab';
import ApiService from '../../../../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../../screens/dashboard/tabs/MatchesTab', () => {
  const originalModule = jest.requireActual('../../../../screens/dashboard/tabs/MatchesTab');
  const component = function(props) {
    component.mockImplementation.props = props;
    return originalModule.default(props);
  };
  component.mockImplementation = {
    props: null,
    swipeLeft: jest.fn(),
    swipeRight: jest.fn(),
    superLike: jest.fn(),
  };
  return component;
});

jest.mock('../../../../services/ApiService', () => ({
  matches: {
    getMatches: jest.fn(),
    swipeLeft: jest.fn(),
    swipeRight: jest.fn(),
    superLike: jest.fn(),
  },
}));

jest.mock('react-native-deck-swiper', () => {
  const { View } = require('react-native');
  return {
    default: View,
  };
});

const mockNavigation = {
  navigate: jest.fn(),
};

describe('MatchesTab Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userId') return Promise.resolve('1');
      return Promise.resolve(null);
    });
    
    ApiService.matches.getMatches.mockResolvedValue({
      data: {
        content: [
          {
            id: 1,
            name: 'Jessica',
            age: 28,
            distance: '3 miles away',
            bio: 'Love hiking and photography',
            images: ['https://randomuser.me/api/portraits/women/33.jpg'],
            interests: ['Travel', 'Photography', 'Coffee'],
            mutualInterests: ['Coffee'],
            compatibility: 85,
          },
          {
            id: 2,
            name: 'Michael',
            age: 30,
            distance: '5 miles away',
            bio: 'Fitness enthusiast and coffee lover',
            images: ['https://randomuser.me/api/portraits/men/52.jpg'],
            interests: ['Fitness', 'Coffee', 'Technology'],
            mutualInterests: ['Coffee'],
            compatibility: 78,
          },
        ],
      },
    });
  });

  test('renders loading state initially', async () => {
    const { getByText, queryByText } = render(<MatchesTab navigation={mockNavigation} />);
    
    expect(getByText('Finding your matches...')).toBeTruthy();
    expect(queryByText('Jessica')).toBeNull();
    
    await waitFor(() => {
      expect(ApiService.matches.getMatches).toHaveBeenCalledTimes(1);
    });
  });

  test('renders matches after loading', async () => {
    const { findByText } = render(<MatchesTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(ApiService.matches.getMatches).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Jessica');
    await findByText('Michael');
    await findByText('28');
    await findByText('30');
  });

  test('handles API error state', async () => {
    ApiService.matches.getMatches.mockRejectedValueOnce(new Error('Network error'));
    
    const { getByText, findByText } = render(<MatchesTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(ApiService.matches.getMatches).toHaveBeenCalledTimes(1);
    });
    
    await findByText('Something went wrong');
    expect(getByText('Failed to load matches. Please try again.')).toBeTruthy();
    
    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();
    
    ApiService.matches.getMatches.mockResolvedValueOnce({
      data: { content: [] },
    });
    
    fireEvent.press(retryButton);
    
    await waitFor(() => {
      expect(ApiService.matches.getMatches).toHaveBeenCalledTimes(2);
    });
  });

  test('handles empty matches state', async () => {
    ApiService.matches.getMatches.mockResolvedValueOnce({
      data: { content: [] },
    });
    
    const { getByText, findByText } = render(<MatchesTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(ApiService.matches.getMatches).toHaveBeenCalledTimes(1);
    });
    
    await findByText('No matches found');
    expect(getByText('Try adjusting your filters or check back later for new matches.')).toBeTruthy();
    
    const expandButton = getByText('Expand Search');
    expect(expandButton).toBeTruthy();
    
    fireEvent.press(expandButton);
    
    await waitFor(() => {
      expect(ApiService.matches.getMatches).toHaveBeenCalledTimes(2);
    });
  });

  test('calls swipeLeft API when swiping left', async () => {
    render(<MatchesTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(ApiService.matches.getMatches).toHaveBeenCalledTimes(1);
    });
    
    act(() => {
      MatchesTab.mockImplementation.swipeLeft(1);
    });
    
    expect(ApiService.matches.swipeLeft).toHaveBeenCalledWith(1);
  });

  test('calls swipeRight API when swiping right', async () => {
    render(<MatchesTab navigation={mockNavigation} />);
    
    await waitFor(() => {
      expect(ApiService.matches.getMatches).toHaveBeenCalledTimes(1);
    });
    
    act(() => {
      MatchesTab.mockImplementation.swipeRight(1);
    });
    
    expect(ApiService.matches.swipeRight).toHaveBeenCalledWith(1);
  });
});
