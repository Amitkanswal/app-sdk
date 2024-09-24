class RegisterEvents {
    private events: { [key: string]: Set<string> } = {};
    private onChangeCallback: (events: { [key: string]: Set<string> }, action:string ) => void;

    constructor(onChangeCallback: (events: { [key: string]: Set<string> }, action:string) => void) {
        this.onChangeCallback = onChangeCallback;
        this.events = this.createObservable(this.events, this.onChangeCallback);
    }

    // Function to create a proxy with change detection
    private createObservable(payload, onChange) {
        return new Proxy(payload, {
            set(target, property, value) {
                const oldValue = target[property];
                target[property] = value;

                // Call the onChange function with details of the change
                onChange(property as string, value, 'set');
                return true;
            },
            deleteProperty(target, property) {
                const oldValue = target[property];
                delete target[property];

                // Call the onChange function with details of the change
                onChange(property as string, oldValue, 'delete');
                return true;
            }
        });
    }

       insertEvent(eventName: string, eventType: string) {
        if (this.events[eventName]) {
            if (this.events[eventName] instanceof Set) {
                const prevLength = this.events[eventName].size;
                this.events[eventName].add(eventType);
                if (prevLength !== this.events[eventName].size) {
                    this.onChangeCallback(this.events, 'insert');
                }
            } else {
                const existingEventType = this.events[eventName] as unknown as string;
                this.events[eventName] = new Set([existingEventType, eventType]);
                if (this.events[eventName].size === 2) {
                    this.onChangeCallback(this.events, 'insert');
                }
            }
        } else {
            this.events[eventName] = new Set([eventType]);
            this.onChangeCallback(this.events, 'insert');
        }
    }

    hasEvent(eventName: string, eventType: string) {
        return this.events[eventName] && this.events[eventName].has(eventType);
    }

    removeEvent(eventName: string, eventType: string) {
        if (this.events[eventName]) {
            this.events[eventName].delete(eventType);
            if (this.events[eventName].size === 0) {
                delete this.events[eventName];
            }
            this.onChangeCallback(this.events, 'remove');
        }
    }

    getRegisterEvents() {
        return this.events;
    }
}

export default RegisterEvents;