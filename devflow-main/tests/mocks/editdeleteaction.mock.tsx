const MockEditDeleteAction = ({ type, itemId }: { type: "question" | "answer"; itemId: string }) => {
  return (
    <div>
      <button>Edit {type}</button>
      <button>Delete {type}</button>
    </div>
  );
};

export { MockEditDeleteAction };
