import Component from "../lib/component.js";

export class Child extends Component<{ id: number }, { id: number }> {
    protected setup(): void {
        this.state = { id: 1 };
    }

    protected setEvents(): void {
        this.addEvent(".increase", "click", () => {
            this.setState({ id: this.state.id + 1 });
        })
        this.addEvent(".decrease", "click", () => {
            // this.setState({ id: this.state.id - 1 });
        })
    }

    protected shouldComponentUpdate(nextProps: { id: number; }, nextState: { id: number; }): boolean {
        
        return true;
    }

    protected render(): string {
        console.log("렌더링");
        return `
            <div class="child">
                <div>child props id : ${this.props.id}</div>
                <div>child state id : ${this.state.id}</div>
                <button class="increase">Child 증가</button>
                <button class="decrease">Child 감소</button>
            </div>
        `
    }

}