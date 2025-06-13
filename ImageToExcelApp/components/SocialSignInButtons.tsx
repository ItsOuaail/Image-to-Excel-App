import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';

interface SocialSignInButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  onFacebookPress: () => void; // If you plan to add Facebook
}

const SocialSignInButtons: React.FC<SocialSignInButtonsProps> = ({ onGooglePress, onApplePress, onFacebookPress }) => {
  return (
    <View style={GlobalStyles.socialButtonContainer}>
      <TouchableOpacity style={GlobalStyles.socialButton} onPress={onGooglePress}>
        <Image source={require('../assets/icons/google_icon.png')} style={GlobalStyles.socialIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={GlobalStyles.socialButton} onPress={onApplePress}>
        <Image source={require('../assets/icons/apple_icon.png')} style={GlobalStyles.socialIcon} />
      </TouchableOpacity>
      {/* <TouchableOpacity style={GlobalStyles.socialButton} onPress={onFacebookPress}>
        <Image source={require('../assets/icons/facebook_icon.png')} style={GlobalStyles.socialIcon} />
      </TouchableOpacity> */}
    </View>
  );
};

// You need to place your social icons in assets/icons/
// For example: assets/icons/google_icon.png, assets/icons/apple_icon.png

export default SocialSignInButtons;