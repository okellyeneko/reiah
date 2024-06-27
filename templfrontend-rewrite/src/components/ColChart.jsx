import { createEffect, createSignal, Index } from "solid-js";
import { DualRangeSlider } from "./DualRangeSlider";

function ColChart() {
  const data = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22,
  ];

  const [from, setFrom] = createSignal(0);
  const [to, setTo] = createSignal(21);

  const numCols = 20;
  const range = Math.max(...data) - Math.min(...data);

  const lower_point = Math.floor(range * 0.1);
  const upper_point = Math.floor(range * 0.9);

  const gap = Math.max(1, Math.floor((upper_point - lower_point) / numCols));

  let freqArray = new Array(22).fill(0);

  data.forEach((el) => {
    const numCol = Math.floor(el / gap);
    if (numCol > numCols) {
      freqArray[21] += 1;
    } else {
      freqArray[numCol] += 1;
    }
  });

  let columnsRef;
  createEffect(() => {
    <Index each={freqArray} fallback={<div>Loading...</div>}>
      {(item, index) => {
        console.log("triggered index");
        return (
          <Column
            width={50}
            height={item() * 100}
            label={item()}
            backgroundColor={
              index + 1 < from() || index + 1 > to() ? "#C6C6C6" : "black"
            }
          />
        );
      }}
    </Index>;
  });

  return (
    <div
      class={`flex flex-col gap-2 w-[500px] h-[700px] bg-white 
        items-center justify-center p-0 m-0`}
    >
      <div class="flex flex-row place-content-between items-end gap-[1%]">
        <Index each={freqArray} fallback={<div>Loading...</div>}>
          {(item, index) => {
            return (
              <Column
                width={50}
                height={item() * 100}
                label={item()}
                backgroundColor={
                  index + 1 < from() || index + 1 > to()
                    ? "bg-[#C6C6C6]"
                    : "bg-black"
                }
              />
            );
          }}
        </Index>
      </div>
      <DualRangeSlider data={data} setTo={setTo} setFrom={setFrom} gap={gap} />
    </div>
  );
}

function Column({ height, label, backgroundColor }) {
  return (
    <div
      class={`${backgroundColor} z-10 border-dashed border-2 border-indigo-600 
      bottom-0 w-[22px] hover:bg-violet-600 cursor-pointer`}
      style={{
        height: `${height}px`,
      }}
      title={label}
    ></div>
  );
}

export { ColChart };
