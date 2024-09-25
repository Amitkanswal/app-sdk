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
                console.log(`Setting property ${property.toString()} to ${value}`);
                if (typeof property === "string") {
                    target[property] = value;
                    this.onChange(target, "set");
                }
                return true;
            },
            deleteProperty: (target, property) => {
                console.log(`Deleting property ${property.toString()}`);
                if (property in target) {
                    if (typeof property === "string") {
                        delete target[property];
                    }
                    this.onChange(target, "delete");
                }
                return true;
            },
        });
    }

    private onChange(events: { [key: string]: Set<string> }, action: string) {
        console.log(`onChange called with action: ${action}`);
        console.log(`Current events: ${JSON.stringify(events)}`);
        this._connection.sendToParent("registeredEvents", {
            [this.installationUID]: {
                appUID: this.appUID,
                locationUID: this.locationUID,
                registeredEvents: events,
                action,
            },
        });
    }

    private debouncedOnChange(events: { [key: string]: Set<string> }, action: string) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = window.setTimeout(() => {
            this.onChange(events, action);
        }, 300); // Adjust the debounce delay as needed
    }

    insertEvent(eventName: string, eventType: string) {
        console.log("insertEvent called with eventName:", eventName, "eventType:", eventType);

        if (!this.events[eventName]) {
            this.events[eventName] = new Set();
        }

        this.events[eventName].add(eventType);
        this.debouncedOnChange(this.events, "insert");

        console.log("Current events after insert:", this.events);
    }

    hasEvent(eventName: string, eventType: string) {
        return this.events[eventName]?.has(eventType);
    }

    removeEvent(eventName: string, eventType: string) {
        console.log("removeEvent called with eventName:", eventName, "eventType:", eventType);

        if (this.events[eventName]) {
            const prevSize = this.events[eventName].size;
            this.events[eventName].delete(eventType);
            if (this.events[eventName].size !== prevSize) {
                if (this.events[eventName].size === 0) {
                    delete this.events[eventName];
                }
                this.onChange(this.events, "remove");
            }
        }

        console.log("Current events after remove:", this.events);
    }

    getRegisterEvents() {
        return this.events;
    }

    // Method to retrieve values from the proxy object
    getEventTypes(eventName: string): Set<string> | undefined {
        return this.events[eventName];
    }
}

export default RegisterEvents;