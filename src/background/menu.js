class Menu
{
  constructor(contexts, ...groups) {
    this.contexts = contexts;
    this.groups = groups;
  }

  addGroup(group) {
    this.groups.push(group);
  }

  apply() {
    chrome.contextMenus.removeAll();

    let firstGroup = true;
    for (let group of this.groups) {
      let firstItem = true;
      for (let item of group.items) {
        if (!item.visible) {
          continue;
        }

        if (firstItem && !firstGroup) {
          chrome.contextMenus.create({ type: 'separator', contexts: this.contexts });
        }

        firstGroup = false;
        firstItem = false;

        if (item instanceof ParentMenu) {
          let id = chrome.contextMenus.create({
            title: item.title,
            contexts: this.contexts
          });

          for (let child of item.children) {
            if (!child.visible) {
              continue;
            }

            chrome.contextMenus.create({
              title: child.title,
              contexts: this.contexts,
              onclick: () => child.run(),
              parentId: id
            });
          }
        } else {
          chrome.contextMenus.create({
            title: item.title,
            contexts: this.contexts,
            onclick: () => item.run()
          });
        }
      }
    }
  }
}

class MenuGroup
{
  constructor(...items) {
    this.items = items;
  }

  addItem(item) {
    this.items.push(item);
  }
}

class ParentMenu
{
  constructor(...children) {
    this.children = children;
  }

  addChild(child) {
    this.children.push(child);
  }

  get title() {
    return '';
  }

  get visible() {
    return false;
  }
}

class RestartTimerParentMenu extends ParentMenu
{
  constructor(...children) {
    super(...children);
  }

  get title() {
    return 'Restart Timer';
  }

  get visible() {
    return true;
  }
}

class Action
{
  get title() {
    return '';
  }

  get visible() {
    return false;
  }

  run() {
  }
}

class StartFocusingAction extends Action
{
  constructor(controller) {
    super();
    this.controller = controller;
  }

  get title() {
    return 'Start Focusing';
  }

  get visible() {
    return true;
  }

  run() {
    this.controller.startFocus();
  }
}

class StartShortBreakAction extends Action
{
  constructor(controller) {
    super();
    this.controller = controller;
  }

  get title() {
    let hasLong = this.controller.settings.longBreak.interval > 0;
    return hasLong ? 'Start Short Break' : 'Start Break';
  }

  get visible() {
    return true;
  }

  run() {
    this.controller.startShortBreak();
  }
}

class StartLongBreakAction extends Action
{
  constructor(controller) {
    super();
    this.controller = controller;
  }

  get title() {
    return 'Start Long Break';
  }

  get visible() {
    return this.controller.settings.longBreak.interval > 0;
  }

  run() {
    this.controller.startLongBreak();
  }
}

class StopTimerAction extends Action
{
  constructor(controller) {
    super();
    this.controller = controller;
  }

  get title() {
    return 'Stop Timer';
  }

  get visible() {
    let state = this.controller.state;
    return (state === TimerState.Running) || (state === TimerState.Paused);
  }

  run() {
    this.controller.stop();
  }
}

class PauseTimerAction extends Action
{
  constructor(controller) {
    super();
    this.controller = controller;
  }

  get title() {
    return 'Pause Timer';
  }

  get visible() {
    return this.controller.state === TimerState.Running;
  }

  run() {
    this.controller.pause();
  }
}

class ResumeTimerAction extends Action
{
  constructor(controller) {
    super();
    this.controller = controller;
  }

  get title() {
    return 'Resume Timer';
  }

  get visible() {
    return this.controller.state === TimerState.Paused;
  }

  run() {
    this.controller.resume();
  }
}

class PomodoroHistoryAction extends Action
{
  constructor(controller) {
    super();
    this.controller = controller;
  }

  get title() {
    return 'Pomodoro History';
  }

  get visible() {
    return true;
  }

  run() {
    this.controller.showOptionsPage('#history');
  }
}

class StartPomodoroCycleAction extends Action
{
  constructor(controller) {
    super();
    this.controller = controller;
  }

  get title() {
    const state = this.controller.state;
    if (state === TimerState.Running || state === TimerState.Paused) {
      return 'Restart Pomodoro Cycle';
    } else {
      return 'Start Pomodoro Cycle';
    }
  }

  get visible() {
    return this.controller.settings.longBreak.interval > 0;
  }

  run() {
    this.controller.startCycle();
  }
}

class PomodoroMenuSelector
{
  constructor(controller, inactive, active) {
    this.controller = controller;
    this.inactive = inactive;
    this.active = active;
  }

  apply() {
    let state = this.controller.state;
    let menu = (state === TimerState.Running || state === TimerState.Paused) ? this.active : this.inactive;
    menu.apply();
  }
}
