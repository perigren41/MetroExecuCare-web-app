import { useState, useEffect, useRef } from "react";
import RoundArrowRightWhiteArrow from "@/assets/RoundArrowRightWhiteArrow.svg";

export default function HRRequestManagementTable({ requests, loading, activeFilter, onViewDetails }) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showMobileSwipeIndicator, setShowMobileSwipeIndicator] = useState(false);
  const tableContainerRef = useRef(null);
  const mobileContainerRef = useRef(null);

  useEffect(() => {
    const checkScroll = () => {
      if (tableContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
        const hasMoreContent = scrollHeight > clientHeight;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
        setShowScrollIndicator(hasMoreContent && !isAtBottom);
      }
    };

    checkScroll();
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [requests]);

  useEffect(() => {
    const checkMobileScroll = () => {
      if (mobileContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = mobileContainerRef.current;
        const hasMoreContent = scrollHeight > clientHeight;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
        setShowMobileSwipeIndicator(hasMoreContent && !isAtBottom);
      }
    };

    checkMobileScroll();
    const container = mobileContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkMobileScroll);
      window.addEventListener('resize', checkMobileScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkMobileScroll);
      }
      window.removeEventListener('resize', checkMobileScroll);
    };
  }, [requests]);

  const formatRequestType = (type) => {
    if (type === 'letter_of_authorization') return 'Letter of Authorization';
    if (type === 'letter_of_approval') return 'Letter of Approval';
    return type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "-";
  };

  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'assigned_to_hr': 'Assigned to HR',
      'hr_processing': 'HR Processing',
      'benefits_review': 'Benefits Review',
      'welfare_review': 'Welfare Review',
      'hr_final_verification': 'HR Final Verification',
      'approved': 'Approved',
      'completed': 'Completed',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "-";
  };

  const getStatusStyling = () => {
    return "text-gray-700 px-2 py-1 text-sm md:text-base font-medium";
  };

  return (
    <div className="relative">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div
          className="p-[2px] rounded-t-[68px] overflow-hidden"
          style={{
            background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
          }}
        >
          <div
            className="bg-white rounded-t-[68px] w-full"
            style={{
              boxShadow: "0px 4px 28px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div
              ref={tableContainerRef}
              className="max-h-[900px] overflow-y-auto overflow-x-auto rounded-t-[68px] relative"
            >
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr
                    style={{
                      height: "56px",
                      background: "linear-gradient(90deg, #3F6EC0 0%, #00539F 33%, #5D3EA4 66%, #7940A8 100%)",
                    }}
                  >
                    <th className="w-[8%] text-center px-2"></th>
                    <th className="w-[20%] text-white font-semibold text-center px-2">Name</th>
                    <th className="w-[15%] text-white font-semibold text-center px-2">Request Number</th>
                    <th className="w-[20%] text-white font-semibold text-center px-2">Type of Request</th>
                    <th className="w-[15%] text-white font-semibold text-center px-2">Submitted</th>
                    <th className="w-[17%] text-white font-semibold text-center px-2">Status</th>
                    <th className="w-[5%] text-center px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr style={{ height: "72px" }}>
                      <td colSpan="7" className="text-center">
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#023184] mr-3"></div>
                          <span className="text-gray-500">Loading requests...</span>
                        </div>
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr style={{ height: "72px" }}>
                      <td colSpan="7" className="text-center text-gray-500">
                        <div className="py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-lg font-medium">No requests found</p>
                          {activeFilter && activeFilter !== "all" && (
                            <p className="text-sm mt-2">Try selecting a different filter</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {requests.map((req, index) => (
                        <tr
                          key={req.id}
                          className={`border-b border-gray-200 hover:bg-blue-50 hover:shadow-md transition-all duration-200 cursor-pointer ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                          style={{ height: "72px" }}
                          onClick={() => onViewDetails && onViewDetails(req)}
                        >
                          <td className="text-center"></td>
                          <td className="text-center px-2">
                            <span className="font-medium text-gray-900">
                              {req.employee_first_name || 'Unknown'} {req.employee_last_name || 'User'}
                            </span>
                          </td>
                          <td className="text-center px-2">
                            <span className="font-medium text-gray-800 text-sm">
                              {req.request_number || req.id}
                            </span>
                          </td>
                          <td className="text-center px-2">
                            <span className="text-gray-700 text-base">
                              {formatRequestType(req.request_type)}
                            </span>
                          </td>
                          <td className="text-center px-2">
                            <span className="text-gray-600 text-base">
                              {new Date(req.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="text-center px-2">
                            <span className={getStatusStyling(req.current_status)}>
                              {formatStatus(req.current_status)}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="flex justify-center">
                              <img
                                src={RoundArrowRightWhiteArrow}
                                alt="View details"
                                className="w-9 h-9"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Fill remaining space with empty rows */}
                      {Array.from({
                        length: Math.max(0, 10 - requests.length),
                      }).map((_, index) => (
                        <tr
                          key={`empty-${index}`}
                          className={`border-b border-gray-200 ${
                            (requests.length + index) % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                          style={{ height: "72px" }}
                        >
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>

              {/* Scroll Indicator */}
              {showScrollIndicator && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
                  <div className="flex flex-col items-center animate-bounce">
                    <span className="text-sm font-medium text-blue-600 mb-1">Scroll</span>
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden relative h-full">
        <div ref={mobileContainerRef} className="space-y-4 overflow-y-auto h-full pb-16">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#023184] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No requests found</p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onViewDetails && onViewDetails(req)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {req.employee_first_name || 'Unknown'} {req.employee_last_name || 'User'}
                    </h3>
                  </div>
                  <img
                    src={RoundArrowRightWhiteArrow}
                    alt="View details"
                    className="w-8 h-8 flex-shrink-0"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Request Number:</span>
                    <span className="text-gray-900 font-medium">{req.request_number || req.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900">{formatRequestType(req.request_type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="text-gray-900">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={getStatusStyling(req.current_status)}>
                      {formatStatus(req.current_status)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Swipe Indicator - Mobile */}
          {showMobileSwipeIndicator && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
              <div className="flex flex-col items-center animate-bounce">
                <span className="text-sm font-medium text-blue-600 mb-1">Swipe</span>
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}