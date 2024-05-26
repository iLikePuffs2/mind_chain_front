// ChangePriority.ts
export const increasePriority = (data) => {
  data.priority += 1;
};

export const decreasePriority = (data) => {
  if (data.priority !== undefined && data.priority > 1) {
    data.priority -= 1;
  }
};
