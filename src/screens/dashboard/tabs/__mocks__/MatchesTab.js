const React = require('react');
const { View, Text, TouchableOpacity } = require('react-native');

function MockMatchesTab(props) {
  return React.createElement(
    View, 
    { testID: props.testID },
    [
      React.createElement(Text, { key: 'loading' }, 'Finding your matches...'),
      
      React.createElement(
        View, 
        { key: 'content', style: { display: 'none' } },
        [
          React.createElement(
            View, 
            { key: 'match-1' },
            [
              React.createElement(Text, { key: 'name' }, 'Jessica, 27'),
              React.createElement(Text, { key: 'location' }, 'New York, NY'),
              React.createElement(Text, { key: 'distance' }, '3 miles away'),
              React.createElement(Text, { key: 'percentage' }, '92%'),
              React.createElement(
                TouchableOpacity, 
                { 
                  key: 'swipe-left', 
                  testID: 'swipe-left-button', 
                  onPress: () => {
                    const ApiService = require('../../../../services/ApiService');
                    ApiService.matches.swipeLeft(1);
                  }
                },
                React.createElement(Text, {}, 'Swipe Left')
              ),
              React.createElement(
                TouchableOpacity, 
                { 
                  key: 'swipe-right', 
                  testID: 'swipe-right-button', 
                  onPress: () => {
                    const ApiService = require('../../../../services/ApiService');
                    ApiService.matches.swipeRight(1);
                  }
                },
                React.createElement(Text, {}, 'Swipe Right')
              )
            ]
          ),
          
          React.createElement(
            View, 
            { key: 'match-2' },
            [
              React.createElement(Text, { key: 'name' }, 'Michael, 29'),
              React.createElement(Text, { key: 'location' }, 'Brooklyn, NY'),
              React.createElement(Text, { key: 'distance' }, '5 miles away'),
              React.createElement(Text, { key: 'percentage' }, '87%'),
            ]
          ),
          
          React.createElement(
            TouchableOpacity, 
            { 
              key: 'filter-button', 
              testID: 'filter-button', 
              onPress: () => {}
            },
            React.createElement(Text, {}, 'Filters')
          ),
          
          React.createElement(
            TouchableOpacity, 
            { 
              key: 'match-info-button', 
              testID: 'match-info-button', 
              onPress: () => {}
            },
            React.createElement(Text, {}, 'Match Info')
          ),
          
          React.createElement(
            View, 
            { key: 'filter-modal', style: { display: 'none' } },
            [
              React.createElement(Text, { key: 'title' }, 'Smart Filters'),
              React.createElement(
                TouchableOpacity, 
                { 
                  key: 'apply', 
                  testID: 'apply-filters-button', 
                  onPress: () => {
                    const ApiService = require('../../../../services/ApiService');
                    ApiService.matches.updateFilterSettings({});
                    ApiService.matches.getMatches();
                  }
                },
                React.createElement(Text, {}, 'Apply')
              ),
              React.createElement(
                TouchableOpacity, 
                { 
                  key: 'close', 
                  testID: 'close-filter-button', 
                  onPress: () => {}
                },
                React.createElement(Text, {}, 'Close')
              )
            ]
          ),
          
          React.createElement(
            View, 
            { key: 'match-tooltip', style: { display: 'none' } },
            [
              React.createElement(Text, { key: 'title' }, 'Why This Match?'),
              React.createElement(Text, { key: 'reason-1' }, 'You both love photography'),
              React.createElement(Text, { key: 'reason-2' }, 'Located in the same city'),
              React.createElement(Text, { key: 'reason-3' }, '85% personality compatibility'),
              React.createElement(
                TouchableOpacity, 
                { 
                  key: 'close', 
                  testID: 'close-tooltip-button', 
                  onPress: () => {}
                },
                React.createElement(Text, {}, 'Close')
              )
            ]
          )
        ]
      ),
      
      React.createElement(
        View, 
        { key: 'error', style: { display: 'none' } },
        [
          React.createElement(Text, { key: 'title' }, 'Something went wrong'),
          React.createElement(Text, { key: 'message' }, 'Failed to load matches. Please try again.'),
          React.createElement(
            TouchableOpacity, 
            { 
              key: 'retry', 
              onPress: () => {
                const ApiService = require('../../../../services/ApiService');
                ApiService.matches.getMatches();
              }
            },
            React.createElement(Text, {}, 'Retry')
          )
        ]
      ),
      
      React.createElement(
        View, 
        { key: 'empty', style: { display: 'none' } },
        [
          React.createElement(Text, { key: 'title' }, 'No matches found'),
          React.createElement(
            Text, 
            { key: 'message' }, 
            'Try adjusting your filters or check back later for new matches.'
          ),
          React.createElement(
            TouchableOpacity, 
            { 
              key: 'expand', 
              onPress: () => {
                const ApiService = require('../../../../services/ApiService');
                ApiService.matches.getMatches();
              }
            },
            React.createElement(Text, {}, 'Expand Search')
          )
        ]
      )
    ]
  );
}

module.exports = MockMatchesTab;
