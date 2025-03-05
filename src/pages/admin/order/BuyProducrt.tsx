import { HiArrowNarrowDown } from "react-icons/hi";
import {PiDotsThreeVertical } from "react-icons/pi";


const BuyProduct = () => {
    return (
    
  <div className="flex flex-col max-w-6xl mx-auto p-6 space-y-6">
    <div className="flex justify-end text-gray-700">User Name</div>
    {/* Header */}
    <div className="flex justify-between items-center pb-4">
      <h1 className="text-xl font-semibold">Organization Name</h1>
    </div>

    {/* Sell Product Section */}
    <div className="bg-gray-100 border rounded-lg p-6">
      <h2 className="text-lg font-semibold">Buy Product</h2>
      <p className="text-gray-500 text-sm">
        Add information of client
      </p>

      {/* Basic Information */}
      <div className="mt-4 flex gap-5">
        <div className="w-1/2">
          <div className="flex justify-between">
          <label htmlFor="clientname">Select Entity</label>
          <p className="underline">+New Entity?</p>
          </div>
          <input
            type="text"
            placeholder="Entity"
            className="p-2 border rounded-md w-full"
            name="Entity"
            />
          <label htmlFor="address">Address</label>
          <input
            type="text"
            placeholder="Address"
            className="p-2 border rounded-md w-full"
            name="address"
          />
        </div>
        <div className="w-1/2">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="text"
            placeholder="Phone Number"
            className="p-2 border rounded-md w-full"
            name="phone"
          />
          <label htmlFor="">Field Name</label>
          <input
            type="text"
            placeholder="Field Name"
            className="p-2 border rounded-md w-full"
            name="fieldname"
          />
        </div>
      </div>
    </div>

    {/* Item Details */}
    <div className="bg-white border rounded-lg p-x-6">
      <h2 className="text-lg font-semibold p-3">Item Details</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 ">S.N.</th>
            <th className="p-2 ">Item Name</th>
            <th></th>
            <th className="p-2 ">Quantity</th>
            <th className="p-2 ">Price</th>
            <th className="p-2 ">Amount</th>
            <th className="p-2 "></th>
          </tr>
        </thead>
        <tbody className="">
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="text-center border-y">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">
                <input type="text" className="w-full p-1 border" />
              </td>
              <HiArrowNarrowDown/>
              <td className="p-2">
                <input type="number" className="w-full p-1 border" />
              </td>
              <td className="p-2">
                <input type="number" className="w-full p-1 border" />
              </td>
              <td className="p-2 ">
                <input type="number" className="w-full p-1 border" />
              </td>
              <PiDotsThreeVertical className="text-2xl mt-3 cursor-pointer"/>
            </tr>
          ))}
        </tbody>
      </table>
      <button className=" w-full my-4 bg-gray-200 text-black px-4 py-2 rounded-md">
        + Add more product
      </button>
    </div>

    {/* Bill Image */}
    <div className="flex flex-wrap justify-center m-9">
      <div className=" border rounded-md w-full p-2 flex flex-wrap justify-between item-center px-5">
        <div>
         <p className="text-2xl">Bill</p>
        </div>
        <button className="bg-gray-600 px-4 rounded-md cursor-pointer text-white">+ Add File</button>
      </div>
        <button className="w-full my-4 bg-gray-600 text-black px-4 py-2 rounded-md text-white">
          + Add Product
        </button>
    </div>
  </div>
);

};

export default BuyProduct;
// className="flex flex-wrap flex-col content-center justify-center bg-white p-6 mt-4 space-y-2"
