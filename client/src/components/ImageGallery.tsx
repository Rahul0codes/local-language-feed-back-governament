// import React from 'react';

// const ImageGallery = () => {
//   const imagesWithCaptions = [
//     { imagePath: 'https://source.unsplash.com/Bd7gNnWJBkU', caption: 'Technology' },
//     { imagePath: "https://source.unsplash.com/OgqWLzWRSaI", caption: 'Sports' },
//     { imagePath: "https://source.unsplash.com/KDBmLUFxHP8", caption: 'Food' },
//     { imagePath: "https://source.unsplash.com/NTyBbu66_SI", caption: 'Health' },
//   ];

//   return (
//     <div className="flex hover:cursor-pointer">
//       {imagesWithCaptions.map((item, index) => (
//         <div
//           key={index}
//           className="flex-none "
//           style={{ width: '25vw', minHeight: '200px' }} 
//         >
//           <img
//             src={item.imagePath}
//             alt={`Image ${index + 1}`}
//             className="w-full h-[450px] hover:scale-[1.01] duration-300"
//           />
//           <p className="text-center font-bold mt-2 uppercase">{item.caption}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ImageGallery;



import React from "react";
import { Zoom } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

const ImageGallery = () => {
  //Array of Images
  // Use topic-relevant Unsplash images (politics/government/election) via the source API
  const images = [
    "https://source.unsplash.com/1600x900/?politics,government",
    "https://source.unsplash.com/1600x900/?election,parliament",
    "https://source.unsplash.com/1600x900/?protest,demonstration",
    "https://source.unsplash.com/1600x900/?press,media",
    "https://source.unsplash.com/1600x900/?politician,assembly",
  ];

  //These are custom properties for zoom effect while slide-show
  const zoomInProperties = {
    scale: 1,
    duration: 5000,
    transitionDuration: 300,
    infinite: true,
    prevArrow: (
      <div className="ml-10 top-40 md:top-72">
        <ArrowLeftIcon className="h-8 w-8 text-white cursor-pointer" />
      </div>
    ),
    nextArrow: (
      <div className="mr-10 top-40 md:top-72">
        <ArrowRightIcon className="h-8 w-8 text-white cursor-pointer" />
      </div>
    ),
  };
  return (
    <div className="w-full h-[70vh]">
      <Zoom {...zoomInProperties}>
          {images.map((each, index) => (
            <div key={index} className="w-full h-[70vh] relative">
              {/* render as background block so missing/cors issues don't show a broken img icon */}
              <div
                role="img"
                aria-label={`slide-${index}`}
                className="w-full h-full bg-center bg-cover opacity-90"
                style={{
                  backgroundImage: `url('${each}'), url('https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1600&q=80')`,
                }}
              />
            </div>
          ))}
      </Zoom>
    </div>
  );
};

export default ImageGallery;
