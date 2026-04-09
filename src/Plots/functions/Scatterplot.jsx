const CIRCLE_SIZE = 40;

const Scatterplot = () => {
  return (
    <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
      <div
        style={{
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          borderRadius: "50%",
          backgroundColor: "dodgerblue",
        }}
      />
      <div
        style={{
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          borderRadius: "50%",
          backgroundColor: "dodgerblue",
        }}
      />
      <div
        style={{
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          borderRadius: "50%",
          backgroundColor: "dodgerblue",
        }}
      />
    </div>
  );
};

export default Scatterplot;