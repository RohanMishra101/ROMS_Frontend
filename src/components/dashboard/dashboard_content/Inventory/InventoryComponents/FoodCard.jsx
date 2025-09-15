import {FaEdit, FaTrash, FaImage, FaCircle} from "react-icons/fa";
import {useState, memo} from "react";

const availabilityConfig = {
    true: {
        dot: "text-emerald-500",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        text: "Available"
    },
    false: {
        dot: "text-red-500",
        badge: "bg-red-100 text-red-800 border-red-200",
        text: "Out of Stock"
    }
};

function FoodCard({item, onEdit, onDelete}) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const priceNum = Number(item.price);
    const formattedPrice = isNaN(priceNum) ? item.price : priceNum.toLocaleString("en-IN", {maximumFractionDigits: 2});

    const availability = availabilityConfig[item.availability];

    // ✅ Dynamically prepend host to relative path
    const baseURL = import.meta.env.VITE_IMAGE_URL || "192.168.1.98:3000";
    // console.log(item.imageURL);
    const imageUrl = item.imageURL ? `${baseURL}${
        item.imageURL.startsWith("/") ? item.imageURL : `/${
            item.imageURL
        }`
    }` : null;

    return (
        <> {/* Food Card */}
            <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-200 sm:hover:-translate-y-1">
                {/* Image Section */}
                <div className="relative h-36 xs:h-40 sm:h-44 md:h-48 lg:h-52 w-full overflow-hidden">
                    {
                    item.imageURL && !imageError ? (
                        <> {/* Placeholder Blur */}
                            {
                            !imageLoaded && (
                                <div className="absolute inset-0 bg-gray-200 animate-pulse"/>
                            )
                        }
                            <img src={imageUrl}
                                alt={
                                    item.name
                                }
                                className={
                                    `w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                                        !imageLoaded ? "opacity-0" : "opacity-100"
                                    }`
                                }
                                loading="lazy"
                                decoding="async"
                                onError={
                                    () => setImageError(true)
                                }
                                onLoad={
                                    () => setImageLoaded(true)
                                }/>
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center text-gray-400">
                            <div className="p-2 xs:p-3 sm:p-4 rounded-full bg-white shadow-sm mb-2 sm:mb-3">
                                <FaImage className="text-lg xs:text-xl sm:text-2xl"/>
                            </div>
                            <span className="text-xs xs:text-sm font-medium px-2 text-center">
                                No Image Available
                            </span>
                        </div>
                    )
                }

                    {/* Availability Indicator */}
                    <div className="absolute top-2 xs:top-3 right-2 xs:right-3">
                        <div className={
                            `flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-medium border backdrop-blur-sm ${
                                availability.badge
                            }`
                        }>
                            <FaCircle className={
                                `text-[4px] xs:text-[6px] ${
                                    availability.dot
                                }`
                            }/>
                            <span className="hidden xs:inline">
                                {
                                availability.text
                            }</span>
                            <span className="xs:hidden">
                                {
                                item.availability ? "✓" : "✗"
                            } </span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-3 xs:p-4 sm:p-5 space-y-3 xs:space-y-4">
                    {/* Header */}
                    <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2 xs:gap-3">
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 text-sm xs:text-base sm:text-lg leading-tight line-clamp-2">
                                    {
                                    item.name
                                } </h3>
                                {
                                item.category && (
                                    <p className="text-[10px] xs:text-xs text-gray-500 uppercase tracking-wide font-medium mt-0.5 xs:mt-1">
                                        {
                                        item.category
                                    } </p>
                                )
                            } </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-gray-900 text-base xs:text-lg sm:text-xl">
                                    ₹{formattedPrice} </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {
                    item.description && (
                        <p className="text-xs xs:text-sm text-gray-600 line-clamp-2 xs:line-clamp-3 leading-relaxed">
                            {
                            item.description
                        } </p>
                    )
                }

                    {/* Action Buttons */}
                    <div className="flex gap-2 xs:gap-2.5 pt-1 xs:pt-2">
                        <button onClick={onEdit}
                            className="flex-1 flex items-center justify-center gap-1.5 xs:gap-2 py-2 xs:py-2.5 px-3 xs:px-4 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg xs:rounded-xl text-xs xs:text-sm font-medium transition-all duration-200 hover:shadow-sm">
                            <FaEdit className="text-xs xs:text-sm"/>
                            <span>Edit</span>
                        </button>
                        <button onClick={
                                () => setShowDeleteModal(true)
                            }
                            className="flex items-center justify-center gap-1.5 xs:gap-2 py-2 xs:py-2.5 px-3 xs:px-4 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg xs:rounded-xl text-xs xs:text-sm font-medium transition-all duration-200 hover:shadow-sm min-w-0">
                            <FaTrash className="text-xs xs:text-sm shrink-0"/>
                            <span className="hidden xs:inline">Delete</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {
            showDeleteModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-3 xs:p-4 z-50 animate-in fade-in duration-200"
                    onClick={
                        () => setShowDeleteModal(false)
                }>
                    <div className="bg-white rounded-xl xs:rounded-2xl shadow-xl max-w-xs xs:max-w-md w-full p-4 xs:p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
                        onClick={
                            (e) => e.stopPropagation()
                    }>
                        <div className="flex items-center gap-2.5 xs:gap-3 mb-3 xs:mb-4">
                            <div className="p-2 xs:p-2.5 bg-red-100 rounded-lg xs:rounded-xl shrink-0">
                                <FaTrash className="text-red-600 text-sm xs:text-lg"/>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base xs:text-lg font-semibold text-gray-900 truncate">
                                    Delete Item
                                </h3>
                                <p className="text-xs xs:text-sm text-gray-500">
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>

                        <p className="text-sm xs:text-base text-gray-700 mb-4 xs:mb-6 leading-relaxed">
                            Are you sure you want to delete{" "}
                            <strong className="break-words">"{
                                item.name
                            }"</strong>?
                            <span className="hidden xs:inline">
                                {" "}
                                All data related to this item will be permanently removed.
                            </span>
                        </p>

                        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                            <button onClick={
                                    () => setShowDeleteModal(false)
                                }
                                className="order-2 xs:order-1 flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg xs:rounded-xl transition-colors duration-200">
                                Cancel
                            </button>
                            <button onClick={
                                    () => {
                                        onDelete();
                                        setShowDeleteModal(false);
                                    }
                                }
                                className="order-1 xs:order-2 flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg xs:rounded-xl transition-colors duration-200">
                                Delete Item
                            </button>
                        </div>
                    </div>
                </div>
            )
        } </>
    );
}

export default memo(FoodCard);
