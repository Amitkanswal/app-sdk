import postRobot from "post-robot";

class RegisterEvents {
    private events: { [key: string]: Set<string> } = {};
    _connection: typeof postRobot;
    installationUID: string;
    appUID: string;
    locationUID: string;
    private debounceTimeout: number | undefined;

    constructor({
        connection,
        installationUID,
        appUID,
        locationUID,
    }: {
        connection: typeof postRobot;
        installationUID: string;
        appUID: string;
        locationUID: string;
    }) {
        this.events = this.createObservable(this.events);
        this._connection = connection;
        this.installationUID = installationUID;
        this.appUID = appUID;
        this.locationUID = locationUID;
    }

    // Function to create a proxy with change detection
    private createObservable(payload) {
        return new Proxy(payload, {
            set: (target, property, value) => {
                target[property] = value;
                this.debouncedOnChange(this.events, "set");
                return true;
            },
            deleteProperty: (target, property) => {
                delete target[property];
                this.debouncedOnChange(this.events, "delete");
                return true;
            }
        });
    }

    private onChange(events: { [key: string]: Set<string> }, action: string) {
        this._connection.sendToParent("registeredEvents", {
            [this.installationUID]: {
                appUID: this.appUID,
                locationUID: this.locationUID,
                registeredEvents: events,
                action,
            },
        });
    }

    private debouncedOnChange = this.debounce(this.onChange.bind(this), 300);

    private debounce(callbackFunction: (...args: any[]) => void, wait: number) {
        return (...args: any[]) => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = window.setTimeout(() => callbackFunction(...args), wait);
        };
    }

    insertEvent(eventName: string, eventType: string) {
        if (this.events[eventName]) {
            if (this.events[eventName] instanceof Set) {
                const prevLength = this.events[eventName].size;
                this.events[eventName].add(eventType);
                if (prevLength !== this.events[eventName].size) {
                    this.debouncedOnChange(this.events, 'insert');
                }
            } else {
                const existingEventType = this.events[eventName] as unknown as string;
                this.events[eventName] = new Set([existingEventType, eventType]);
                if (this.events[eventName].size === 2) {
                    this.debouncedOnChange(this.events, 'insert');
                }
            }
        } else {
            this.events[eventName] = new Set([eventType]);
            this.debouncedOnChange(this.events, 'insert');
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
            this.debouncedOnChange(this.events, 'remove');
        }
    }

    getRegisterEvents() {
        return this.events;
    }
}

export default RegisterEvents;