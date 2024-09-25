import postRobot from "post-robot";
import { Subject } from "rxjs";

class RegisterEvents {
    private events: { [key: string]: Set<string> } = {};
    private eventsSubject = new Subject<{ events: { [key: string]: Set<string> }, action: string }>();
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
        this._connection = connection;
        this.installationUID = installationUID;
        this.appUID = appUID;
        this.locationUID = locationUID;

        // Subscribe to the eventsSubject to handle changes
        this.eventsSubject.subscribe(({ events, action }) => {
            this.onChange(events, action);
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
            this.eventsSubject.next({ events, action });
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
                this.eventsSubject.next({ events: this.events, action: "remove" });
            }
        }

        console.log("Current events after remove:", this.events);
    }

    getRegisterEvents() {
        return this.events;
    }

    // Method to retrieve values from the events object
    getEventTypes(eventName: string): Set<string> | undefined {
        return this.events[eventName];
    }
}

export default RegisterEvents;