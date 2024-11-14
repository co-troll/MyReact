export const reconciliation = (_originEl: HTMLElement, _newEl: HTMLElement) => {
    const _originNodes = [..._originEl.childNodes];
    const _newNodes = [..._newEl.childNodes];
    const max = Math.max(_originNodes.length, _newNodes.length);
    for (let i = 0; i < max; i++) {
        updateNode(_originEl, _originNodes[i], _newNodes[i]);
    }
}

const updateNode = (_target: HTMLElement, _originNode: ChildNode, _newNode: ChildNode) => {
    if (_originNode && !_newNode) return _originNode.remove();

    if (!_originNode && _newNode) return _target.appendChild(_newNode);

    if (_originNode instanceof Text && _newNode instanceof Text) {
        if (_originNode.nodeValue === _newNode.nodeValue) return;
        _originNode.nodeValue = _newNode.nodeValue;
        return;
    }

    if (_originNode.nodeName !== _newNode.nodeName) {
        return _target.replaceChild(_newNode, _originNode);
    }

    const _originEl = _originNode as HTMLElement;
    const _newEl = _newNode as HTMLElement;

    updateAttributes(_originEl, _newEl);

    if (_originEl.firstElementChild?.getAttribute("key") && _newEl.firstElementChild?.getAttribute("key")) {
        return updateByKey(_originEl, _newEl);
    }

    reconciliation(_originEl, _newEl);
}

const updateAttributes = (_originNode: HTMLElement, _newNode: HTMLElement) => {
    [..._newNode.attributes].forEach(({ name, value }) => {
        if (value === _originNode.getAttribute(name)) return;
        _originNode.setAttribute(name, value);
    });

    [..._originNode.attributes].forEach(({ name }) => {
        if (_newNode.hasAttribute(name)) return;
        _originNode.removeAttribute(name);
    })
}

type THash = Record<string, HTMLElement>;

const updateByKey = (_originEl: HTMLElement, _newEl: HTMLElement) => {
    const _originEls = [..._originEl.children] as HTMLElement[];
    const _newEls = [..._newEl.children] as HTMLElement[];

    const originKeyObj: THash = {};
    const originNodeOrders: string[] = [];
    _originEls.forEach((originEl) => {
        const key = originEl.getAttribute("key");
        if (!key) throw new Error("key is not defined");
        originKeyObj[key] = originEl;
        originNodeOrders.push(key);
    })

    const newKeyObj: THash = {};
    const newNodeOrders: string[] = [];
    _newEls.forEach((newEl) => {
        const key = newEl.getAttribute("key");
        if (!key) throw new Error("key is not defined");
        newKeyObj[key] = newEl;
        newNodeOrders.push(key);
    })

    originNodeOrders.forEach((key) => {
        const originEl = originKeyObj[key];
        const newEl = newKeyObj[key];
        if (!newEl) {
            originEl.remove();
        }
    })

    newNodeOrders.forEach((key, index) => {
        const originEl = originKeyObj[key];
        const newEl = newKeyObj[key];
        if (!originEl) {
            return _originEl.insertBefore(newEl, _originEl.children[index]);
        }
        updateNode(_originEl, originEl, newEl);
    })
}