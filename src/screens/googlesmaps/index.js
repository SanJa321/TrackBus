import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Animated, FlatList, Text, BackHandler, Keyboard } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7C6FF3',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIconContainer: {
    borderRadius: 20, // Circle shape
    padding: 10,
  },
  searchIcon: {
    color: 'white',
  },
  input: {
    height: 40,
    marginRight: 10,
    flex: 1,
    fontSize: 16,
    color: 'white', // Text color
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '22%',
    width: '100%',
    height: '30%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    backgroundColor: 'gray',
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
  },
  itemText: {
    fontSize: 16,
    color: '#352D84',
  },
});

export default function GoogleMapsScreen() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const position = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null); // Reference to the TextInput

  // Handle the back button press to hide the search bar
  useEffect(() => {
    const backAction = () => {
      if (searchVisible) {
        // Hide the search bar when the back button is pressed
        Animated.timing(position, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }).start(() => {
          setSearchVisible(false);
        });
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [searchVisible]);

  const toggleSearchBar = () => {
    if (!searchVisible) {
      setSearchVisible(true);
      Animated.timing(position, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }

    if (searchVisible) {
      setShowSuggestions(false);
      Keyboard.dismiss(); // Hide the keyboard when clicking on the search icon again
    }
  };

  const containerTop = position.interpolate({
    inputRange: [0, 1],
    outputRange: ['90%', '10%'],
  });

  const handleTextChange = (text) => {
    setSearchText(text);
    if (text) {
      setShowSuggestions(true); // Show suggestions when user starts typing
    }

    // Simulate suggestion logic
    const dummySuggestions = ['Thimphu', 'Thimphu City', 'Thimphu Valley'].filter(item =>
      item.toLowerCase().includes(text.toLowerCase())
    );
    setSuggestions(dummySuggestions);

    // Update recent searches
    if (text && !recentSearches.includes(text)) {
      setRecentSearches([...recentSearches, text]);
    }
  };

  const handleItemPress = (item) => {
    setSearchText(item);
    setShowSuggestions(false); // Hide the suggestions container
  };

  const handleSearchSubmit = () => {
    setShowSuggestions(false); // Hide suggestions when user submits search
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={styles.itemContainer}>
        <View style={styles.iconContainer}>
          <Icon name="clock-o" size={16} color="white" />
        </View>
        <Text style={styles.itemText}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  const displayItems = searchText ? suggestions : recentSearches;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: 27.4712,
          longitude: 89.6339,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      />

      <Animated.View style={[styles.searchContainer, { top: containerTop, width: searchVisible ? '90%' : '50%' }]}>
        {searchVisible && (
          <TextInput
            ref={inputRef} // Reference to the input
            style={styles.input}
            placeholder="Search here..."
            placeholderTextColor="white"
            value={searchText}
            onChangeText={handleTextChange}
            onFocus={() => setShowSuggestions(true)} // Show suggestions when input is focused
            onSubmitEditing={handleSearchSubmit}
          />
        )}

        <TouchableOpacity
          style={[
            styles.searchIconContainer,
            {
              backgroundColor: searchVisible ? 'gray' : 'transparent',
              position: searchVisible ? 'absolute' : 'relative',
              right: searchVisible ? 0 : 'auto',
            },
          ]}
          onPress={() => {
            toggleSearchBar();
            if (searchVisible) {
              // Do not show the keyboard when search icon is clicked
              Keyboard.dismiss();
            } else {
              // Focus on the input when the search icon is clicked
              inputRef.current?.focus();
            }
          }}
        >
          <Icon name="search" size={24} style={styles.searchIcon} />
        </TouchableOpacity>
      </Animated.View>

      {/* Show Suggestions and Recent Searches Box only when there are items to display */}
      {searchVisible && displayItems.length > 0 && showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={displayItems}
            renderItem={renderItem}
            keyExtractor={(item) => item}
          />
        </View>
      )}
    </View>
  );
}
