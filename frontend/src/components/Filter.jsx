import { createSignal, onCleanup, onMount } from "solid-js";
import filter_img from "/assets/Filter.png";

const Filter = () => {
  const [filterDisplay, setFilterDisplay] = createSignal(true);

  const toggleFilter = () => {
    setFilterDisplay(!filterDisplay());
  };

  return (
    <div class="absolute m-0 px-0 top-[5vh] left-[70vw] w-[30vw] bg-green h-[95vh] z-20 flex flex-col items-center delay-[300ms] animate-fade-in">
      {/* <button
        class="bg-blue rounded-2xl cursor-pointer w-32 h-9 text-white flex items-center justify-center gap-1.5 hover:-translate-y-1 hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
        onClick={toggleFilter}
      >
        <img src={filter_img} alt="filter" />
        <span>Filter</span>
      </button> */}
      {filterDisplay() && (
        <div class="">
          <p>Filter</p>
        </div>
      )}
    </div>
  );
};

export default Filter;
