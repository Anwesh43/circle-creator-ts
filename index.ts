const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.02
const strokeFactor : number = 90
const sizeFactor : number = 8
const foreColor : string = "#4CAF50"
const backColor : string = "#BDBDBD"
const delay : number = 30
const maxCircles : number = 5

class DrawingUtil {

    static drawArc(context : CanvasRenderingContext2D, x : number, y : number, scale : number) {
        const r : number = Math.min(w, h) / sizeFactor
        context.save()
        context.translate(x, y)
        context.beginPath()
        context.moveTo(r, 0)
        for (var i = 0; i <= 360 * scale; i++) {
            const xr : number = r * Math.cos(i * Math.PI / 180)
            const yr : number = r * Math.sin(i * Math.PI / 180)
            context.lineTo(xr, yr)
        }
        context.stroke()
        context.restore()
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(cb : Function) {
        this.scale += this.dir * scGap
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class CircleCreatorNode {

    state1 : State = new State()

    state2 : State = new State()

    constructor(private x : number, private y : number) {

    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawArc(context, this.x, this.y + (h - this.y) * this.state2.scale, this.state1.scale)
    }

    sweep(cb : Function) {
        this.state1.update(cb)
    }

    move(cb : Function) {
        this.state2.update(cb)
    }

    startSweeping(cb : Function) {
        this.state1.startUpdating(cb)
    }

    startMoving(cb : Function) {
        this.state2.startUpdating(cb)
    }
}

class CircleCreatorContainer {

    ccs : Array<CircleCreatorNode> = new Array()
    curr : CircleCreatorNode
    first : CircleCreatorNode

    draw(context : CanvasRenderingContext2D) {
        this.ccs.forEach((cc) => {
            cc.draw(context)
        })
    }

    update(cb : Function) {
        if (this.first && this.first != null) {
            this.first.move(() => {
                this.ccs.splice(0, 1)
                this.curr.startSweeping(() => {
                    this.ccs.push(this.curr)
                })
            })
        } else {
            this.curr.sweep(cb)
        }
    }

    startUpdating(cb : Function, x : number, y : number) {
        this.curr = new CircleCreatorNode(x, y)
        if (this.ccs.length == maxCircles) {
            this.first = this.ccs[0]
            this.first.startMoving(cb)
        } else {
            this.ccs.push(this.curr)
            this.curr.startSweeping(cb)
        }
    }
}
