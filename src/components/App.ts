import { Child } from "./Child.js";
import Component from "../lib/component.js";


export class App extends Component<{}, { id: number }> {
    _child!: Component;

    protected setup(): void {
        this.state = { id: 1 };
    }

    componentDidMount(): void {
        setTimeout(() => this.setState({ id: 10 }), 1000);
    }

    protected setEvents(): void {
        this.addEvent(".increase", "click", () => {
            this.setState({ id: this.state.id + 1 });
        })
        this.addEvent(".decrease", "click", () => {
            this.setState({ id: this.state.id - 1 });
        })
    }

    protected addComponents(): void {
        this._child = this.addComponent(Child, { id: this.state.id });
    }

    protected componentDidUpdate(prevProps: {}, prevState: { id: number; }): void {
    }

    protected render(): string {
        return `
            <div class="app"> 
                <h1>App</h1>
                <div>id: ${this.state.id}</div>
                <button class="increase">App 증가</button>
                <button class="decrease">App 감소</button>
                <${this._child.id} id=${this.state.id}></${this._child.id}>
            </div>
        `;
    }
}

// new App(document.querySelector('#root') as HTMLElement, {});