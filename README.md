## react-native-moving-image

This is a package that allows you to create movable React Native Component. 
This package works on both iOS and Android Platform.  

This is a very simple Javascript-only library with the usage of React Native.
 
## Introduction
 This package allows you to create a component that can be move with one or two fingers.
 Moreover, you can rotate the component by using two fingers at once and rotate by your will.

## Basic Usage

1. Run `npm install git://git.twin-local.site:react-native-libs/react-native-moving-image.git`  
1. Import the MovableImage Component in anywhere of your project:

    ```javascript
    import MovableImage from 'react-native-moving-image'
    
    export default class App extends Component {
	      render(){
		       return(
			        <MovableImage width = {300} height = {100}>
			            //some components you want to move here
			        </MovableImage>
   		     )
	      }
     }
    ```
 1. Edit the `width` and the `height` props to fit your Component.
 
## Contribution
 
 **Issue** are welcome. Be free to add the issue if you find any bugs in the 
  package. Please add a screenshot of bug and code for quicker fix.
  