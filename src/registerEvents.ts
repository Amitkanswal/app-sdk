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
    private localStorageKey: string;

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
        this.localStorageKey = `events_${this.installationUID}_${this.appUID}_${this.locationUID}`;

        // Load events from localStorage
        this.loadEventsFromLocalStorage();

        // Subscribe to the eventsSubject to handle changes
        this.eventsSubject.subscribe({
            next: ({ events, action }) => {
                this.onChange(events, action);
            }
        });
    }

    private onChange(events: { [key: string]: Set<string> }, action: string) {
        const serializedEvents = this.serializeEvents(events);

        // Save events to localStorage
        this.saveEventsToLocalStorage(serializedEvents);

        this._connection.sendToParent("registeredEvents", {
            [this.installationUID]: {
                appUID: this.appUID,
                registeredEvents: {
                    [this.locationUID]: serializedEvents,
                },
                action,
            },
        });
    }

    private saveEventsToLocalStorage(events: { [key: string]: string[] }) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(events));
    }

    private loadEventsFromLocalStorage() {
        const storedEvents = localStorage.getItem(this.localStorageKey);
        if (storedEvents) {
            const parsedEvents = JSON.parse(storedEvents);
            this.events = this.deserializeEvents(parsedEvents);
        }
    }

    private serializeEvents(events: { [key: string]: Set<string> }): { [key: string]: string[] } {
        return Object.fromEntries(
            Object.entries(events).map(([key, value]) => [key, Array.from(value)])
        );
    }

    private deserializeEvents(events: { [key: string]: string[] }): { [key: string]: Set<string> } {
        return Object.fromEntries(
            Object.entries(events).map(([key, value]) => [key, new Set(value)])
        );
    }

    insertEvent(eventName: string, eventType: string) {
        if (!this.events[eventName]) {
            this.events[eventName] = new Set();
        }
        if (!this.hasEvent(eventName, eventType)) {
            this.events[eventName].add(eventType);
            this.eventsSubject.next({ events: this.events, action: "insert" });
        }
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
                this.eventsSubject.next({ events: this.events, action: "remove" });
            }
        }
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