import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { controlPanelAnimation } from './animations/control-panel.animation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [controlPanelAnimation]
})

export class AppComponent {
  controlPanelActive: boolean = true;
  innerHeight: any;   //height of the screen (excluding taskbar, url search bar, etc..)
  innerWidth: any;    //width of the screen
  height: number;   // Height of the canvas. Keep aspect ratio (height is 4/5 of width)
  width: number;   // Width of the canvas.
  maxIterations: number = 50;
  threshold: number = 4;
  lightCoefficient: number = 1;
  colors: string[] = ["blue-green", "grey", "yellow-red", "yellow", "red", "green", "pink", "blue-white"];
  selectedColor: string = "grey";
  destMinX: number = -3;
  destMaxX: number = 2;
  destMinY: number = -1.25;
  destMaxY: number = 1.25;
  interiorColor: string = "black";

  @ViewChild("fractalCanvas") canvas: ElementRef;

  constructor() {
    this.innerHeight = window.innerHeight ;
    this.innerWidth = window.innerWidth;
    this.height = innerWidth * 0.5;   // Height of the canvas. Keep aspect ratio (height is 1/2 of width)
    this.width = innerWidth;   // Width of the canvas.
  }

  ngAfterViewInit() {
    this.drawFractal();
  }

  @HostListener('mousedown', ['$event']) mouseHandling(event) {
    if (event.target.id === "fractal-canvas") {
      if (event.shiftKey === false) {
        let srcCenterX: number = event.pageX;
        let srcCenterY: number = event.pageY;
        let srcTopLeft: number[] = [srcCenterX - 200, srcCenterY + 100];
        let srcTopRight: number[] = [srcCenterX + 200, srcCenterY + 100];
        let srcBottomLeft: number[] = [srcCenterX - 200, srcCenterY - 100];
        let srcBottomRight: number[] = [srcCenterX + 200, srcCenterY - 100];
        let destTopLeft: number[] = this.coordinateTransformation(srcTopLeft[0], srcTopLeft[1], 0, this.width, 0, this.height);
        let destTopRight: number[] = this.coordinateTransformation(srcTopRight[0], srcTopRight[1], 0, this.width, 0, this.height);
        let destBottomLeft: number[] = this.coordinateTransformation(srcBottomLeft[0], srcBottomLeft[1], 0, this.width, 0, this.height);
        this.destMinX = destTopLeft[0];
        this.destMaxX = destTopRight[0];
        this.destMinY = destTopLeft[1];
        this.destMaxY = destBottomLeft[1];
        this.drawFractal();
      } else if (event.shiftKey === true){
          let destWidth = Math.abs(this.destMaxX - this.destMinX)
          this.destMinX -= destWidth * 0.6
          this.destMaxX += destWidth * 0.6
          this.destMinY -= destWidth * 0.3
          this.destMaxY += destWidth * 0.3
          this.drawFractal();
      }
    }
  }

  onReset() {
    this.maxIterations = 50;
    this.threshold = 4;
    this.lightCoefficient = 1;
    this.destMinX = -3;
    this.destMaxX = 2;
    this.destMinY = -1.25;
    this.destMaxY = 1.25;
    this.interiorColor = "black";
    this.selectedColor = "grey";
    this.drawFractal();
  }

  onDraw(iterations: string, threshold: string, lightCoefficient: string) {
    if (iterations !== '') {
      this.maxIterations = Number(iterations);
    }
    if (threshold !== '') {
      this.threshold = Number(threshold);
    }
    if (lightCoefficient !== '') {
      this.lightCoefficient = Number(lightCoefficient);
    }
    this.drawFractal();
  }

  drawFractal() {
    let context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext("2d");
    let newImg = context.createImageData(this.width, this.height);
    for (let i = 0; i < newImg.data.length; i += 4) {
      let y = Math.floor(i / (this.width * 4));    // Find y coordinate based on current index.
      let x = (i - ((y) * this.width * 4)) / 4;   // Find x coordinate based on current index.
      let result = this.iterate(x, y)
      let colorArray = this.getColor(result[1])
      if (result[0] === true) {
        if (this.interiorColor === "white") {
          newImg.data[i] = 255
          newImg.data[i + 1] = 255
          newImg.data[i + 2] = 255
          newImg.data[i + 3] = 255
        } else if (this.interiorColor === "black") {
          newImg.data[i] = 0
          newImg.data[i + 1] = 0
          newImg.data[i + 2] = 0
          newImg.data[i + 3] = 255
        }
      } else {
        newImg.data[i] = colorArray[0]
        newImg.data[i + 1] = colorArray[1]
        newImg.data[i + 2] = colorArray[2]
        newImg.data[i + 3] = 255
      }
    }
    context.putImageData(newImg, 0, 0);
  }

  iterate(x: number, y: number): [boolean, number] {
    let newPoint: number[] = this.coordinateTransformation(x, y, 0, this.width, 0, this.height);
    let newX: number = newPoint[0];
    let newY: number = newPoint[1];
    let ReZ: number = newX;   // Real part of Z
    let ImZ: number = newY;   // Imaginary part of Z.
    let magZ: number = Math.sqrt(newX**2 + newY**2);    // Magnitude of Z.
    let iterationCount: number = 0;
    while(magZ < this.threshold && iterationCount < this.maxIterations) {
      // Z_a = Z_a-1 ^ 2  +  newX + i*newY
      let previousReZ = ReZ
      //ReZ = ReZ**3 - (3*ReZ*ImZ**2) + newX;
      //ImZ = 3*ImZ*previousReZ**2 - ImZ**3 + newY;
      ReZ = ReZ**2 - ImZ**2 + newX;
      ImZ = 2*previousReZ*ImZ + newY;
      magZ = ReZ**2 + ImZ**2;
      iterationCount++;
    }
    // Recurrence relation tends to infinity. Color white.
    if (magZ >= this.threshold) {
      for (let i = 0; i < 4; i++) {   // Perform a few extra iterations to further smooth the coloring
        let previousReZ = ReZ
        ReZ = ReZ**2 - ImZ**2 + newX;
        ImZ = 2 * previousReZ * ImZ + newY;
        magZ = ReZ**2 + ImZ**2;
        iterationCount++;
      }
      return [false, iterationCount - Math.log2(Math.log2(magZ))]
    }
    // Recurrence relation doesn't tend to infinity. Color black.
    if (iterationCount === this.maxIterations) {
      return [true, iterationCount - Math.log2(Math.log2(magZ))]
    }
  }

  coordinateTransformation(srcX: number, srcY: number, srcMinX: number, srcMaxX: number, srcMinY: number, srcMaxY: number): number[] {
    let temp = srcMinY;
    srcMinY = -srcMaxY;
    srcMaxY = -temp;
    let destX = (srcX - srcMinX) / (srcMaxX - srcMinX) * (this.destMaxX - this.destMinX) + this.destMinX;
    let destY = (-srcY - srcMinY) / (srcMaxY - srcMinY) * (this.destMaxY - this.destMinY) + this.destMinY;
    return [destX, destY];
  }

  getColor(iterations: number): number[] {
    let colorArray: number[] = [0, 0, 0];
    switch(this.selectedColor) {
      case "blue-green": {
        if (iterations < 0.33*this.maxIterations) {
          colorArray[0] = 0;
          colorArray[1] = 0;
          colorArray[2] = ((255 / (0.33 * this.maxIterations)) * iterations) * this.lightCoefficient;
          return colorArray
        } else if (iterations < 0.66 * this.maxIterations) {
          colorArray[0] = 0;
          colorArray[1] = ((255 / (0.66 * this.maxIterations - 0.33 * this.maxIterations)) * iterations - (255 / (0.66 * this.maxIterations - 0.33 * this.maxIterations)) * (0.33 * this.maxIterations)) * this.lightCoefficient;
          colorArray[2] = 255;
          return colorArray
        } else {
          colorArray[0] = 0
          colorArray[1] = 255
          colorArray[2] = 255 - (((255 / (this.maxIterations - 0.66 * this.maxIterations)) * iterations - (255 / (this.maxIterations - 0.66 * this.maxIterations)) * (0.66 * this.maxIterations)) * this.lightCoefficient);
          return colorArray
        }
      }
      case "yellow-red": {
        if (iterations < 0.5*this.maxIterations) {
          colorArray[0] = 255;
          colorArray[1] = 200 - ((255 / (0.5*this.maxIterations)) * iterations) * this.lightCoefficient;
          colorArray[2] = 0;
          return colorArray
        } else {
          colorArray[0] = 255;
          colorArray[1] = 0;
          colorArray[2] = ((255 / (this.maxIterations - 0.5*this.maxIterations)) * iterations - (255 / (this.maxIterations - 0.5*this.maxIterations)) * (0.5*this.maxIterations)) * this.lightCoefficient;
          return colorArray
        }
      }
      case "grey": {
        colorArray[0] = ((255 / this.maxIterations) * iterations) * this.lightCoefficient;
        colorArray[1] = colorArray[0];
        colorArray[2] = colorArray[0];
        return colorArray;
      }
      case "yellow": {
        colorArray[0] = ((255 / this.maxIterations) * iterations) * this.lightCoefficient;
        colorArray[1] = colorArray[0];
        colorArray[2] = 0;
        return colorArray;
      }
      case "red": {
        colorArray[0] = ((255 / this.maxIterations) * iterations) * this.lightCoefficient;
        colorArray[1] = 0;
        colorArray[2] = 0;
        return colorArray;
      }
      case "green": {
        colorArray[0] = 0;
        colorArray[1] = ((255 / this.maxIterations) * iterations) * this.lightCoefficient;
        colorArray[2] = 0;
        return colorArray;
      }
      case "pink": {
        colorArray[0] = ((255 / this.maxIterations) * iterations) * this.lightCoefficient;
        colorArray[1] = 0;
        colorArray[2] = ((255 / this.maxIterations) * iterations) * this.lightCoefficient;
        return colorArray;
      }
      case "blue-white": {
        colorArray[0] = 0;
        colorArray[1] = ((255 / this.maxIterations) * iterations) * this.lightCoefficient;
        colorArray[2] = ((255 / this.maxIterations) * iterations) * this.lightCoefficient;
        return colorArray;
      }
    }
  }

  toggleControlPanel(): void {
    this.controlPanelActive = !this.controlPanelActive;
  }
}
