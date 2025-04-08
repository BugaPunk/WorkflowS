import { MainLayout } from "../layouts/MainLayout.tsx";

export default function Contact() {
  return (
    <MainLayout title="Contact - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto">
          <h1 class="text-4xl font-bold mb-6">Contact Us</h1>
          
          <div class="bg-white shadow-md rounded-lg p-6 mb-6">
            <form class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
                  Name
                </label>
                <input 
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                  id="name" 
                  type="text" 
                  placeholder="Your Name"
                />
              </div>
              
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                  Email
                </label>
                <input 
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2" for="message">
                  Message
                </label>
                <textarea 
                  class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                  id="message" 
                  placeholder="Your message here..."
                  rows={4}
                ></textarea>
              </div>
              
              <div>
                <button 
                  class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                  type="button"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
          
          <div class="mt-8">
            <h2 class="text-2xl font-semibold mb-4">Other Ways to Reach Us</h2>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-bold text-lg mb-2">Email</h3>
                <p>contact@workflowsapp.com</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-bold text-lg mb-2">Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
