import axios from "axios";
import { useEffect, useState, useCallback, useRef } from "react";
import { SlLink } from "react-icons/sl";
import { IconContext } from "react-icons";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const latestRequest = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();
    latestRequest.current = controller;

    const delaySearch = setTimeout(async () => {
      try {
        const response = await axios.get(
          `http://localhost:4001/trips?keywords=${searchTerm}`,
          { signal: controller.signal }
        );
        if (latestRequest.current === controller) {
          setTrips(response.data.data || []);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching trips:", error);
        }
      } finally {
        if (latestRequest.current === controller) {
          setIsLoading(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(delaySearch);
      controller.abort(); // ยกเลิก request ก่อนหน้า
    };
  }, [searchTerm]);

  const handleChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCopyClick = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('ลิงก์ถูกคัดลอกแล้ว!');
      })
      .catch((err) => {
        console.error('เกิดข้อผิดพลาดในการคัดลอก:', err);
      });
  };

  return (
    <div className="w-full mx-auto p-6 font-kanit">
      <header className="text-center text-5xl text-sky-500 mb-6">
        เที่ยวไหนดี
      </header>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg text-gray-900">ค้นหาที่เที่ยว</h2>
        <div className="relative mb-6">
          <input
            id="search"
            name="search"
            type="text"
            value={searchTerm}
            onChange={handleChange}
            className="w-full focus:outline-none text-center placeholder:text-center"
            placeholder="หาที่เที่ยวแล้วไปกัน ..."
          />
          <hr className="border-t border-gray-300 mx-auto"></hr>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-6 flex flex-wrap justify-center">
          {trips.length > 0 ? (
            trips.map((trip, index) => (
              <div
                key={`${trip.id}-${index}`}
                className="flex flex-wrap gap-6 bg-white p-4"
              >
                <img
                  src={trip.photos?.[0] || "https://via.placeholder.com/300"}
                  alt={trip.title}
                  className="w-[350px] h-[250px] object-cover rounded-2xl"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    {trip.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {trip.description.slice(0, 100)}...
                  </p>
                  <a
                    href={trip.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-500 underline hover:text-sky-600 mt-2 self-start"
                  >
                    อ่านต่อ
                  </a>
                  <div className="text-gray-500 text-xs flex gap-2 flex-wrap">
                    <p>หมวด</p>
                    {trip.tags
                      .map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            if (!searchTerm.includes(tag)) {
                              setSearchTerm((prev) =>
                                prev ? `${prev} ${tag}` : tag
                              );
                            } else {
                              setSearchTerm((prev) =>
                                prev
                                  .split(" ")
                                  .filter((t) => t !== tag)
                                  .join(" ")
                              );
                            }
                          }}
                          className="underline hover:text-gray-600"
                        >
                          {tag}
                        </button>
                      ))
                      .reduce(
                        (acc, curr, index, arr) =>
                          index === arr.length - 1
                            ? [...acc, " และ ", curr]
                            : [...acc, curr, " "],
                        []
                      )}
                  </div>
                  <div className="flex justify-between items-end w-full">
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {trip.photos?.slice(1, 4).map((photo, index) => (
                        <img
                          key={index}
                          src={photo || "https://via.placeholder.com/100"}
                          alt="thumbnail"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                    <div className="flex justify-center items-center border-3 border-sky-500 rounded-full w-16 h-16">
                      <button
                        type="button"
                        onClick={() => handleCopyClick(trip.url)} // ใช้ trip.url ที่ส่งจาก map
                        className="hover:cursor-pointer"
                      >
                        <IconContext.Provider value={{ color: "#0EA5E9", size: "2.5em" }}>
                          <SlLink />
                        </IconContext.Provider>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center">ไม่พบข้อมูล</div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;