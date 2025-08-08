import { HourlyBookingForm } from '@/components/hourly-booking/hourly-booking-form';
import PageLayout from '@/components/layout/PageLayout';

export default function HourlyBookingPage() {
  return (
    <PageLayout
      title="Event & Group Booking"
      description="Book hourly transportation for events, corporate travel, and group transportation"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Hourly Booking', href: '/hourly-booking' }
      ]}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Event & Group Booking
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Perfect for corporate events, weddings, airport transfers, and group transportation. 
              Book hourly transportation with our premium fleet of vehicles.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
              <div className="text-3xl mb-4">⏰</div>
              <h3 className="text-lg font-semibold mb-2">Flexible Duration</h3>
              <p className="text-slate-600">Book from 4 to 24 hours with hourly pricing</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">Group Transport</h3>
              <p className="text-slate-600">Multiple vehicles for large groups and events</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
              <div className="text-3xl mb-4">🚗</div>
              <h3 className="text-lg font-semibold mb-2">Premium Fleet</h3>
              <p className="text-slate-600">Executive and VIP vehicles available</p>
            </div>
          </div>

          {/* Booking Form */}
          <HourlyBookingForm />
        </div>
      </div>
    </PageLayout>
  );
} 