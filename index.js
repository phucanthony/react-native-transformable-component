import React, { Component, PropsTypes } from 'react';
import { Dimensions, View, StyleSheet, PanResponder, Image } from 'react-native'

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default class TransformableView extends Component {
	constructor(props){
		super(props);
		this.mode = 'none';
		this.deg = null;
		this.viewX = null;
		this.viewY = null;
		this.imageSize = null;
		this.rotate = 0;
		this.scale = 1;
		this.topBarcode = this.props.containerStyle.height * 0.3;
		this.leftBarcode = this.props.containerStyle.width * 0.15;
		this.view = null;
		this.customStyle = {
			style:{
				top: this.topBarcode,
				left: this.leftBarcode,
				transform: [{ rotate: `${this.rotate}deg`}, {scale: this.scale}],
			}
		};

		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder:(event,gesture) => true,
			onPanResponderMove: this._onPanResponderMove.bind(this),
			onPanResponderStart: this._onPanResponderStart.bind(this),
			onPanResponderRelease: this._onPanResponderRelease.bind(this),
		});
	}

	updateNativeProps(){
		this.view && this.view.setNativeProps(this.customStyle);
	}

	static getMidPoint(nativeEvent){
		let midPoint = {};
		midPoint.x = 0.5 * (nativeEvent.touches[0].pageX + nativeEvent.touches[1].pageX);
		midPoint.y = 0.5 * (nativeEvent.touches[0].pageY + nativeEvent.touches[1].pageY);
		return midPoint;
	}

	_onPanResponderStart({ nativeEvent }: Object){
		switch (nativeEvent.touches.length){
			case 1:
				this.mode = 'move';
				this.viewX = nativeEvent.touches[0].pageX;
				this.viewY = nativeEvent.touches[0].pageY;
				break;
			case 2:
				let midPoint = MovableImage.getMidPoint(nativeEvent);
				this.mode = 'moveRotateZoom';
				this.deg = MovableImage._twoFinger2Deg(nativeEvent);
				this.viewX = midPoint.x;
				this.viewY = midPoint.y;
				this.imageSize = MovableImage._twoFingerDistance(nativeEvent);
				break;
		}
	}

	static _twoFinger2Deg(nativeEvent){
		let obj1 ={};
		obj1.x = nativeEvent.touches[0].pageX;
		obj1.y = nativeEvent.touches[0].pageY;
		let obj2 ={};
		obj2.x = nativeEvent.touches[1].pageX;
		obj2.y = nativeEvent.touches[1].pageY;
		return Math.atan2(obj2.y - obj1.y,obj2.x - obj1.x)*(180/Math.PI);
	}

	static _twoFingerDistance(nativeEvent){
		let obj1 ={};
		obj1.x = nativeEvent.touches[0].pageX;
		obj1.y = nativeEvent.touches[0].pageY;
		let obj2 ={};
		obj2.x = nativeEvent.touches[1].pageX;
		obj2.y = nativeEvent.touches[1].pageY;
		return Math.sqrt(Math.pow(obj2.y - obj1.y,2)+Math.pow(obj2.x - obj1.x,2));
	}

	static getTheOutsideBox(rotate,width,height,scale){
		let obj = {};
		let rotatePlus = Math.abs(rotate);
		let rotateDegree;
		if (rotatePlus%180 >= 0 && rotatePlus%180 <= 90){
			rotateDegree = rotatePlus%180;
		}
		else {
			rotateDegree = 180 - rotatePlus%180;
		}
		let rotateRad = rotateDegree * Math.PI / 180;
		obj.width = (width * Math.cos(rotateRad) + height * Math.sin(rotateRad)) * scale;
		obj.height = (width * Math.sin(rotateRad) + height * Math.cos(rotateRad)) * scale;
		return obj;
	}

	static getTheLimit(outsideBox,originalWidth,originalHeight,containerWidth,containerHeight){
		let limit = {};
		limit.limitLeft = 0.5 * (outsideBox.width - originalWidth);
		limit.limitTop = 0.5 * (outsideBox.height - originalHeight);
		limit.limitRight = containerWidth - outsideBox.width + limit.limitLeft;
		limit.limitBottom = containerHeight - outsideBox.height + limit.limitTop - 25;
		return limit;
	}

	move(nativeEvent){
		if(this.viewX !== null && this.viewY !== null){
			const diffX = this.viewX - nativeEvent.touches[0].pageX;
			const diffY = this.viewY - nativeEvent.touches[0].pageY;
			this.viewX = nativeEvent.touches[0].pageX;
			this.viewY = nativeEvent.touches[0].pageY;
			this.topBarcode = this.topBarcode - diffY;
			this.leftBarcode = this.leftBarcode - diffX;
			let outsideBox = MovableImage.getTheOutsideBox(this.rotate,this.props.componentStyle.width,this.props.componentStyle.height,this.scale);
			let limit = MovableImage.getTheLimit(outsideBox,this.props.componentStyle.width,this.props.componentStyle.height,this.props.containerStyle.width,this.props.containerStyle.height);
			if(this.topBarcode > limit.limitTop && this.topBarcode < limit.limitBottom
				&& this.leftBarcode > limit.limitLeft && this.leftBarcode < limit.limitRight){
				this.customStyle.style.top = this.topBarcode;
				this.customStyle.style.left = this.leftBarcode;
			}else {
				this.relocateBarcode(limit);
			}
			this.updateNativeProps();
		}
	}

	moveTwoFinger(nativeEvent){
		if(this.viewX !== null && this.viewY !== null){
			let midPointAfter = MovableImage.getMidPoint(nativeEvent);
			const diffX = this.viewX - midPointAfter.x;
			const diffY = this.viewY - midPointAfter.y;
			this.viewX = midPointAfter.x;
			this.viewY = midPointAfter.y;
			this.topBarcode = this.topBarcode - diffY;
			this.leftBarcode = this.leftBarcode - diffX;
			let outsideBox = MovableImage.getTheOutsideBox(this.rotate,this.props.componentStyle.width,this.props.componentStyle.height,this.scale);
			let limit = MovableImage.getTheLimit(outsideBox,this.props.componentStyle.width,this.props.componentStyle.height,this.props.containerStyle.width,this.props.containerStyle.height);
			if(this.topBarcode > limit.limitTop && this.topBarcode < limit.limitBottom
				&& this.leftBarcode > limit.limitLeft && this.leftBarcode < limit.limitRight){
				this.customStyle.style.top = this.topBarcode;
				this.customStyle.style.left = this.leftBarcode;
			}else {
				this.relocateBarcode(limit);
			}
			this.updateNativeProps();
		}
	}

	rotateBarcode(nativeEvent){
		if(this.deg!==null){
			const fingerDeg = MovableImage._twoFinger2Deg(nativeEvent);
			const diffDeg = this.deg - fingerDeg;
			this.deg = fingerDeg;
			this.rotate-=diffDeg;
			this.customStyle.style.transform = [{rotate: this.rotate + 'deg'}, {scale: this.scale}];
			let outsideBox = MovableImage.getTheOutsideBox(this.rotate,this.props.componentStyle.width,this.props.componentStyle.height,this.scale);
			if (outsideBox.width < this.props.containerStyle.width && outsideBox.height < this.props.containerStyle.height && this.scale > 0.2){
				this.customStyle.style.transform = [{rotate: this.rotate + 'deg'}, {scale: this.scale}];
			}
			else {
				this.resizeBarcode(outsideBox,this.props.componentStyle.width,this.props.componentStyle.height,this.rotate)
			}
			let limit = MovableImage.getTheLimit(outsideBox,this.props.componentStyle.width,this.props.componentStyle.height,this.props.containerStyle.width,this.props.containerStyle.height);
			this.relocateBarcode(limit);
			this.updateNativeProps()
		}
	}

	zoomBarcode(nativeEvent){
		if(this.imageSize !== null){
			let distanceAfter = MovableImage._twoFingerDistance(nativeEvent);
			const scaleChange = distanceAfter / this.imageSize;
			this.imageSize = distanceAfter;
			this.scale = this.scale * scaleChange;
			let outsideBox = MovableImage.getTheOutsideBox(this.rotate,this.props.componentStyle.width,this.props.componentStyle.height,this.scale);
			if (outsideBox.width < this.props.containerStyle.width && outsideBox.height < this.props.containerStyle.height && this.scale > 0.2){
				this.customStyle.style.transform = [{rotate: this.rotate + 'deg'}, {scale: this.scale}];
			}
			else {
				this.resizeBarcode(outsideBox,this.props.componentStyle.width,this.props.componentStyle.height,this.rotate)
			}
			this.updateNativeProps()
		}
	}

	resizeBarcode(outsideBox, originalWidth, originalHeight, rotate){
		let rotatePlus = Math.abs(rotate);
		let rotateDegree;
		if (rotatePlus%180 >= 0 && rotatePlus%180 <= 90){
			rotateDegree = rotatePlus%180;
		}
		else {
			rotateDegree = 180 - rotatePlus%180;
		}
		let rotateRad = rotateDegree * Math.PI / 180;
		if (this.scale <= 0.2) {
			this.scale = 0.2;
			this.customStyle.style.transform = [{rotate: this.rotate + 'deg'}, {scale: this.scale}]
		}
		if(outsideBox.width >= this.props.containerStyle.width){
			this.scale = this.props.containerStyle.width / (originalWidth * Math.cos(rotateRad) + originalHeight * Math.sin(rotateRad));
			this.customStyle.style.transform = [{rotate: this.rotate + 'deg'}, {scale: this.scale}]
		}
		if(outsideBox.height >= this.props.containerStyle.height){
			this.scale = this.props.containerStyle.height / (originalWidth * Math.sin(rotateRad) + originalHeight * Math.cos(rotateRad));
			this.customStyle.style.transform = [{rotate: this.rotate + 'deg'}, {scale: this.scale}]
		}
	}

	relocateBarcode(limit){
		if(this.topBarcode <= limit.limitTop){
			this.topBarcode = limit.limitTop;
			this.customStyle.style.top = this.topBarcode;
			this.customStyle.style.left = this.leftBarcode;
		}
		if(this.topBarcode >= limit.limitBottom){
			this.topBarcode = limit.limitBottom;
			this.customStyle.style.top = this.topBarcode;
			this.customStyle.style.left = this.leftBarcode;
		}
		if(this.leftBarcode <= limit.limitLeft){
			this.leftBarcode = limit.limitLeft;
			this.customStyle.style.left = this.leftBarcode;
			this.customStyle.style.top = this.topBarcode;
		}
		if(this.leftBarcode >= limit.limitRight){
			this.leftBarcode = limit.limitRight;
			this.customStyle.style.left = this.leftBarcode;
			this.customStyle.style.top = this.topBarcode;
		}
	}

	doNothing(){

	}

	_onPanResponderMove({ nativeEvent }: Object, gesture: Object) {
		let fingerCount = nativeEvent.touches.length;
		switch (this.mode) {
			case 'move':
				if(fingerCount===1) {
					(this.props.movable) ? this.move(nativeEvent) : this.doNothing();
				}
				break;
			case 'moveRotateZoom':
				if(fingerCount===2) {
					(this.props.movable) ? this.moveTwoFinger(nativeEvent) : this.doNothing() ;
					(this.props.rotatable) ? this.rotateBarcode(nativeEvent) : this.doNothing();
					(this.props.zoomable) ? this.zoomBarcode(nativeEvent) : this.doNothing();
				}
		}
	}

	_onPanResponderRelease({ nativeEvent }: Object, gesture: Object){
		this.deg=null;
		this.viewX = null;
		this.viewY = null;
		this.mode = null;
		this.imageSize = null;
	}

	render(){
		return(
			<View style={this.props.containerStyle}  {...this.panResponder.panHandlers}>
				<View ref={(view)=> this.view=view}
							style={[styles.image, {width: this.props.componentStyle.width, height: this.props.componentStyle.height}]}
							accessibilityLabel = {this.props.ID}>
					<Image source={this.props.image} style={this.props.componentStyle} resizeMode="stretch"/>
				</View>
			</View>
		)
	}
}

MovableImage.defaultProps = {
	containerStyle: {
		height: deviceHeight,
		width: deviceWidth,
		backgroundColor: 'transparent'
	},
	componentStyle: {
		width: deviceWidth * 0.7,
		height: deviceHeight * 0.15,
	},
	movable: true,
	rotatable: true,
	zoomable: true,
};

const styles = StyleSheet.create({
	image:{
		position:'absolute',
		top: deviceHeight * 0.3,
		left: deviceWidth * 0.15,
	},
});
