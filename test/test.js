const app = new PIXI.Application();
document.body.appendChild(app.view);

var graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

graphics.beginFill(0xff0000);
graphics.drawRect(0, 0, 300, 200);
graphics.angle = 10;
