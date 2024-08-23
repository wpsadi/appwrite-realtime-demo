import ChatApp from "@/components/chatApp"


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <>
      <div className="min-h-full">
      
        <main>
          <div className="mx-auto "><ChatApp/></div>
        </main>
      </div>
    </>
  )
}
