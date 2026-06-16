const LocationSearchPanel = ({
  setPanelOpen,
  suggestions,
  setSuggestions, // Add this prop to update suggestions
  setPickUp,
  setDestination,
  activeField,
  setIgnoreNextFetch, // Prop to ignore next fetch on suggestion click
}) => {
  const handlerLocationsuggestions = async (location) => {
    if (!location) return;

    if (setIgnoreNextFetch) {
      setIgnoreNextFetch(true);
    }

    if (activeField === "pickup") {
      setPickUp(location);
      setPanelOpen(true);
    } else {
      setDestination(location);
      setPanelOpen(false); // Close panel when destination is selected
    }

    // Correct way to clear suggestions
    setSuggestions([]); 
  };

  return (
    <div>
      {suggestions.map((location, index) => (
        <div
          key={index}
          onClick={() => handlerLocationsuggestions(location)}
          className="flex items-center gap-4 border-2 p-3 border-gray-200 active:border-black rounded-xl my-3 cursor-pointer transition"
        >
          {/* Fully Rounded Circle Icon */}
          <div className="h-10 w-10 flex items-center justify-center bg-gray-200 rounded-full flex-shrink-0">
            <i className="ri-map-pin-fill text-xl text-black"></i>
          </div>

          {/* Location Text */}
          <h4 className="ml-2 text-gray-800">{location}</h4>
        </div>
      ))}
    </div>
  );
};

export default LocationSearchPanel;
