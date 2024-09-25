import postRobot from "post-robot";
class RegisterEvents {
    private events: { [key: string]: Set<string> } = {};
    _connection: typeof postRobot;
    installationUID: string;
    appUID: string;
    locationUID: string;
    private debounceTimeout: number = 0;

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

    private createObservable(payload: { [key: string]: Set<string> }) {
        return new Proxy(payload, {
            set: (target, property, value) => {
                if (typeof property === "string") {
                    target[property as string] = value;
                    console.log("target",target);
                    console.log("property",property);
                    console.log("value",value);
                    
                    this.debouncedOnChange(target, "set");
                }
                return true;
            },
            deleteProperty: (target, property) => {
                if (property in target) {
                    if (typeof property === "string") {
                        delete target[property];
                    }
                    this.debouncedOnChange(target, "delete");
                }
                return true;
            },
        });
    }

    private onChange(events: { [key: string]: Set<string> }, action: string) {
        console.log("events",events);
        console.log("this.events", this.events);
        
        this._connection.sendToParent("registeredEvents", {
            [this.installationUID]: {
                appUID: this.appUID,
                locationUID: this.locationUID,
                registeredEvents: this.events,
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
        console.log("eventName",eventName);
        console.log("eventType",eventType);
        
        if (!this.events[eventName]) {
            this.events[eventName] = new Set();
        }

        // const prevLength = this.events[eventName]?.size;
        this.events[eventName].add(eventType);
        // if (this.events[eventName].size !== prevLength) {
            this.debouncedOnChange(this.events, "insert");
        // }
        console.log("event",this.events);
        
    }

    hasEvent(eventName: string, eventType: string) {
        return this.events[eventName]?.has(eventType);
    }

    removeEvent(eventName: string, eventType: string) {
        if (this.events[eventName]) {
            const prevSize = this.events[eventName].size;
            this.events[eventName].delete(eventType);
            if (this.events[eventName].size !== prevSize) {
                if (this.events[eventName].size === 0) {
                    delete this.events[eventName];
                }
                this.debouncedOnChange(this.events, "remove");
            }
        }
    }

    getRegisterEvents() {
        return this.events;
    }
}

export default RegisterEvents;
