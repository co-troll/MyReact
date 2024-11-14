import { reconciliation } from "./diff.js";
import { debounceFrame, getJSONparse } from "./helper.js";

const  TAG = "C-";

interface IComponents {
    [key: string]: Component;
}

type TProps = Record<string, any>;

abstract class Component<P = {}, S = {}> {
    protected props: P;
    protected state!: S;


    public _el: HTMLElement;
    private getNewEl(isInit?: boolean) {
        return this.parseHTML(this.render(), isInit);
    }

    private _components: IComponents = {};

    static ID = 0;
    public id = TAG + Component.ID;

    constructor(props: P) {
        Component.ID += 1;
        this.setup();
        this.addComponents();
        this.props = props;
        this._el = this.getNewEl(true);
        this.componentDidMount();
        this.setEvents();
    }

    protected setup() {
    }

    private update() {
        reconciliation(this._el, this.getNewEl());
    }
    
    protected abstract render(): string;
    
    protected addComponents() {}

    protected addComponent<PT = {}>(ComponentClass: new (props: PT) => Component, props: PT): Component {
        const newComponent: Component = new ComponentClass(props);
        this._components[newComponent.id] = newComponent;
        return newComponent;
    }

    protected appendComponent() {}


    protected addEvent(selector: string, eventType: keyof DocumentEventMap, callback: (e: Event) => void) {
        const children = [...this._el.querySelectorAll(selector)];
        const isTarget = (target: HTMLElement) => children.indexOf(target);
        this._el.addEventListener(eventType, (e) => {
            if (isTarget(e.target as HTMLElement) !== 0) return false;
            callback(e);
        })
    }

    protected setState<K extends keyof S>(newState: Pick<S, K> | S | null, callback?: Function) {
        const prevState = { ...this.state };
        if (!this.checkNeedUpdate(newState)) return;
        if (!this.shouldComponentUpdate({ ...this.props }, { ...newState as S } )) return;
        this.state = { ...this.state, ...newState };
        this.componentDidUpdate({ ...this.props }, { ...prevState });
        debounceFrame(() => {
            this.update();
            callback?.();
        })();
    }

    private checkNeedUpdate(newState: any) {
        for (const key in newState) {
            //@ts-ignore
            if (!Object.is(newState[key], this.state[key])) return true;
        }
        return false;
    }

    protected setEvents() {};

    protected componentDidMount() {}

    protected shouldComponentUpdate(nextProps: P, nextState: S): boolean { return true }

    protected componentDidUpdate(prevProps: P, prevState: S) {}

    protected componentWillUnmount() {}


    private updateProps(id: string, props: TProps) {
        if (this._components[id]) {
            this._components[id].props = props;
            this._components[id].update();
        }
    }

    private async replaceComponent(_el: HTMLElement, id: string, isInit?: boolean) {
        const nextProps: TProps = {};
        [..._el.attributes].forEach(({ name, value }) => {
            // @ts-ignore
            if (this._components[id].props[name] === undefined) 
                throw new Error(`check props, name: ${name} value: ${value}`);
            nextProps[name] = getJSONparse(value);
        })

        this.updateProps(id, nextProps);

        const el = isInit ? 
            (this._components[id]._el as HTMLElement) : 
            (this._components[id]._el as HTMLElement).cloneNode(true);
        _el.replaceWith(el);
    }

    private dfsForReplaceComponent(_target: HTMLElement, isInit?: boolean) {
        const _children = [..._target.children];
        const { nodeName } = _target;

        if (nodeName.startsWith("C-")) {
            this.replaceComponent(_target, nodeName, isInit);
        }

        _children.forEach((_el) => {
            this.dfsForReplaceComponent(_el as HTMLElement, isInit);
        })
    }

    private parseHTML(html: string, isInit?: boolean): HTMLElement {
        const _el = document.createElement("div");
        _el.innerHTML = html;

        this.dfsForReplaceComponent(_el, isInit);

        return _el.firstElementChild as HTMLElement;
    }
}

export default Component;
