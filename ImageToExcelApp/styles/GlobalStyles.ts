import { StyleSheet } from 'react-native';

export const GlobalStyles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff',
paddingHorizontal: 20,
},
title: {
fontSize: 28,
fontWeight: 'bold',
marginBottom: 10,
color: '#333',
},
subtitle: {
fontSize: 16,
color: '#666',
marginBottom: 20,
textAlign: 'center',
},
input: {
height: 50,
backgroundColor: '#F7F7F7',
borderRadius: 10,
paddingHorizontal: 15,
marginBottom: 15,
fontSize: 16,
borderWidth: 1,
borderColor: '#E8E8E8',
},
button: {
height: 50,
borderRadius: 10,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#4A90E2', // Primary blue from Figma
marginBottom: 15,
},
buttonText: {
color: '#fff',
fontSize: 18,
fontWeight: 'bold',
},
socialButtonContainer: {
flexDirection: 'row',
justifyContent: 'center',
marginTop: 20,
},
socialButton: {
width: 50,
height: 50,
borderRadius: 25,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: '#F7F7F7',
marginHorizontal: 10,
borderWidth: 1,
borderColor: '#E8E8E8',
},
socialIcon: {
width: 24,
height: 24,
},
linkText: {
color: '#4A90E2',
fontSize: 14,
fontWeight: '600',
},
textCenter: {
textAlign: 'center',
},
// Add other common styles based on your Figma
});