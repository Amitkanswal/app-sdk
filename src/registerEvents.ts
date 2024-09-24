class RegisterEvents {
  private events: { [key: string]: Set<string> } = {};

  insertEvent(eventName: string, eventType: string) {
      if (this.events[eventName]) {
          if (this.events[eventName] instanceof Set) {
              this.events[eventName].add(eventType);
          } else {
              const existingEventType = this.events[eventName] as unknown as string;
              this.events[eventName] = new Set([existingEventType, eventType]);
          }
      } else {
          this.events[eventName] = new Set([eventType]);
      }
  }

  hasEvent(eventName: string, eventType: string) {
        return this.events[eventName] && this.events[eventName].has(eventType);
  }

//   removeEvent(eventName: string, eventType: string) {
//       if (this.events[eventName]) {
//           this.events[eventName].delete(eventType);
//           if (this.events[eventName].size === 0) {
//               delete this.events[eventName];
//           }
//       }
//   }

  getRegisterEvents() {
      return this.events;
  }
}

export default RegisterEvents;