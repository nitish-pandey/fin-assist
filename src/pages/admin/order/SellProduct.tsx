
import { HiArrowNarrowDown } from "react-icons/hi";
import {PiDotsThreeVertical } from "react-icons/pi";


const SellProduct = () => {
  return (
    <div className="flex flex-col max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-end text-gray-700">User Name</div>
      {/* Header */}
      <div className="flex justify-between items-center pb-4">
        <h1 className="text-xl font-semibold">Organization Name</h1>
      </div>

      {/* Sell Product Section */}
      <div className="bg-gray-100 border rounded-lg p-6">
        <h2 className="text-lg font-semibold">Sell Product</h2>
        <p className="text-gray-500 text-sm">
          A descriptive body text comes here
        </p>

        {/* Basic Information */}
        <div className="mt-4 flex gap-5">
          <div>
            <label htmlFor="clientname">Client Name</label>
            <input
              type="text"
              placeholder="Client Name"
              className="p-2 border rounded-md w-full"
              name="clientname"
            />

            <label htmlFor="address">Address</label>
            <input
              type="text"
              placeholder="Address"
              className="p-2 border rounded-md w-full"
              name="address"
            />
          </div>
          <div>
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

      {/* Amount Summary */}
      <div className="border flex flex-wrap justify-center ">
        <div className=" w-1/3 pt-2">
          <div className="border flex justify-center">
            <p>Amount</p>
          </div>
          <div className="flex justify-between pl-5 border">
            <p>Total Amount:</p>
            <p>
              <span className="font-semibold">Rs. 100</span>
            </p>
          </div>
          <div className="flex justify-between  pl-5 border">
            <p>13% VAT: </p>
            <p>
              <span className="font-semibold">Rs. 13</span>
            </p>
          </div>
          <div className="flex justify-between pl-5 border">
            <p>Additional Discount:</p>
            <p>
              {" "}
              <span className="font-semibold">Rs.0</span>
            </p>
          </div>
          <div className="flex justify-between pl-5 border">
            <p>Field:</p>
            <p>
              {" "}
              <span className="font-semibold">Rs. 12</span>
            </p>
          </div>
          <div className="flex justify-between pl-5 border">
            <p className="font-bold">Amount to be Paid:</p>
            <p> Rs. 115</p>
          </div>
          <button className="w-full my-4 bg-gray-200 text-black px-4 py-2 rounded-md">
            + Proceed
          </button>
        </div>
      </div>
    </div>
  )
}

export default SellProduct;